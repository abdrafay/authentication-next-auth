import { Schema, model, Document, models } from 'mongoose';

interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: 'student' | 'tutor' | 'admin' ;
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['tutor','student', 'admin'], default: 'student' }
});

const User = models.User || model<IUser>('User', UserSchema);

export default User;