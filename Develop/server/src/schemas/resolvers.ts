import { IResolvers } from '@graphql-tools/utils';
import User, { IUser } from '../models/User';  // Importando el modelo User
import {IBook} from '../models/Book';
import { authenticateToken } from '../services/auth'; // Asegúrate de tener esta función
import { AuthenticationError } from '../services/auth';

const resolvers: IResolvers = {
    Query: {
        me: async (_, __, { user }): Promise<IUser | null> => {
            if (!user) throw new AuthenticationError('You must be logged in');
            const foundUser = await User.findById(user.id).populate('savedBooks');
            return foundUser;
        },
    },
    Mutation: {
        createUser: async (
            _: any,
            { username, email, password }: { username: string; email: string; password: string }
        ): Promise<{ token: string; user: IUser }> => {
            const newUser = await User.create({ username, email, password });
            const token = authenticateToken(newUser);
            return { token, user: newUser };
        },

        login: async (
            _: any,
            { email, password }: { email: string; password: string }
        ): Promise<{ token: string; user: IUser }> => {
            const user = await User.findOne({ email });
            if (!user || !(await user.isCorrectPassword(password))) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = authenticateToken(user);
            return { token, user };
        },

        saveBook: async (
            _: any,
            { bookInput }: { bookInput: IBook },  // Aquí usas IBook como tipo de entrada
            { user }
        ): Promise<IUser> => {
            if (!user) throw new AuthenticationError('You must be logged in');
            const updatedUser = await User.findByIdAndUpdate(
                user.id,
                { $addToSet: { savedBooks: bookInput } },
                { new: true, runValidators: true }
            ).populate('savedBooks');
            if (!updatedUser) throw new Error('User not found');
            return updatedUser;
        },

        deleteBook: async (
            _: any,
            { bookId }: { bookId: string },
            { user }
        ): Promise<IUser> => {
            if (!user) throw new AuthenticationError('You must be logged in');
            const updatedUser = await User.findByIdAndUpdate(
                user.id,
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            ).populate('savedBooks');
            if (!updatedUser) throw new Error('User not found');
            return updatedUser;
        },
    },
};

export default resolvers;
