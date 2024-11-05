import User from '../models/User.js'; // Importando el modelo User
// import { authenticateToken } from '../services/auth.js';
import { AuthenticationError } from '../services/auth.js';
import { signToken } from '../services/auth.js';
const resolvers = {
    Query: {
        me: async (_, __, { user }) => {
            if (!user)
                throw new AuthenticationError('You must be logged in');
            try {
                const foundUser = await User.findById(user._id).populate('savedBooks');
                if (!foundUser) {
                    throw new Error('User not found');
                }
                return foundUser;
            }
            catch (err) {
                console.error('Error fetching user:', err);
                throw new Error('Error fetching user');
            }
        },
    },
    Mutation: {
        createUser: async (_, { username, email, password }) => {
            try {
                const newUser = await User.create({ username, email, password });
                const token = signToken(newUser.username, newUser.email, newUser._id);
                return { token, user: newUser };
            }
            catch (error) {
                console.error("Error creating user:", error);
                throw new Error("User creation failed");
            }
        },
        login: async (_, { email, password }) => {
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
        saveBook: async (_, { bookInput }, { user }) => {
            // Revisar si el usuario está autenticado
            console.log("User in saveBook mutation:", user);
            if (!user)
                throw new AuthenticationError('You must be logged in');
            user.savedBooks = user.savedBooks || []; // Garantiza que sea un array
            // Verificar si el libro ya está guardado
            const existingBook = user.savedBooks.some((book) => book.bookId === bookInput.bookId);
            if (existingBook) {
                throw new Error("Book is already saved.");
            }
            // Actualiza al usuario con el nuevo libro guardado
            const updatedUser = await User.findByIdAndUpdate(user._id, { $addToSet: { savedBooks: bookInput } }, { new: true, runValidators: true }).populate('savedBooks');
            if (!updatedUser)
                throw new Error('User not found');
            return updatedUser;
        },
        deleteBook: async (_, { bookId }, { user }) => {
            if (!user)
                throw new AuthenticationError('You must be logged in');
            // Elimina el libro cuyo 'bookId' coincide con el proporcionado
            const updatedUser = await User.findByIdAndUpdate(user._id, { $pull: { savedBooks: { bookId } } }, // Aquí usamos bookId en lugar de bookInput
            { new: true }).populate('savedBooks');
            if (!updatedUser)
                throw new Error('User not found');
            return updatedUser;
        },
    },
};
export default resolvers;
