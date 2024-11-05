import { IResolvers } from '@graphql-tools/utils';
import User, { IUser } from '../models/User.js';  // Importando el modelo User
import { IBook } from '../models/Book';
// import { authenticateToken } from '../services/auth.js';
import { AuthenticationError } from '../services/auth.js';
import { signToken } from '../services/auth.js';

const resolvers: IResolvers = {
    Query: {
        me: async (_, __, { user }): Promise<IUser | null> => {
            if (!user) throw new AuthenticationError('You must be logged in');
            try {
                const foundUser = await User.findById(user._id).populate('savedBooks');
                if (!foundUser) {
                    throw new Error('User not found');
                }
                return foundUser;
            } catch (err) {
                console.error('Error fetching user:', err);
                throw new Error('Error fetching user');
            }
        },
    },
    Mutation: {
        createUser: async (
            _: any,
            { username, email, password }: { username: string; email: string; password: string }
        ): Promise<{ token: string; user: IUser }> => {
            try {
                const newUser = await User.create({ username, email, password }) as IUser;
                const token = signToken(newUser.username, newUser.email, newUser._id);
                return { token, user: newUser };
            } catch (error) {
                console.error("Error creating user:", error);
                throw new Error("User creation failed");
            }
        },
        login: async (
            _: any,
            { email, password }: { email: string; password: string }
        ): Promise<{ token: string; user: IUser }> => {
            // Busca al usuario en la base de datos
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('No user found with this email address');
            }

            // Verifica la contraseña
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect password');
            }

            // Genera el token
            const token = signToken(user.username, user.email, user._id); // Asegúrate de que signToken está definido

            return { token, user }; // Asegúrate de devolver el token aquí
        },

        saveBook: async (
            _: any,
            { bookInput }: { bookInput: IBook },
            { user }: { user: IUser, req: any }
        ): Promise<IUser> => {
            // Revisar si el usuario está autenticado
            console.log("User in saveBook mutation:", user);
            if (!user) throw new AuthenticationError('You must be logged in');

            user.savedBooks = user.savedBooks || []; // Garantiza que sea un array

            // Verificar si el libro ya está guardado
            const existingBook = user.savedBooks.some((book) => book.bookId === bookInput.bookId);
            if (existingBook) {
                throw new Error("Book is already saved.");
            }

            // Actualiza al usuario con el nuevo libro guardado
            const updatedUser = await User.findByIdAndUpdate(user._id,
                { $addToSet: { savedBooks: bookInput } },
                { new: true, runValidators: true }
            ).populate('savedBooks');

            if (!updatedUser) throw new Error('User not found');



            return updatedUser;
        },

        deleteBook: async (
            _: any,
            { bookId }: { bookId: string },
            { user }: { user: IUser, req: any }
        ): Promise<IUser> => {
            if (!user) throw new AuthenticationError('You must be logged in');

            // Elimina el libro cuyo 'bookId' coincide con el proporcionado
            const updatedUser = await User.findByIdAndUpdate(
                user._id,
                { $pull: { savedBooks: { bookId } } },  // Aquí usamos bookId en lugar de bookInput
                { new: true }
            ).populate('savedBooks');

            if (!updatedUser) throw new Error('User not found');

            return updatedUser;
        },
    },
};

export default resolvers;
