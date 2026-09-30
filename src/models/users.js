import bcrypt from 'bcrypt';
import db from './db.js';

const createUser = async (name, email, passwordHash) => {
    const defaultRole = 'user';
    const query = `
        INSERT INTO public.users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, (
            SELECT role_id FROM public.roles WHERE role_name = $4
        ))
        RETURNING user_id
    `;
    const queryParams = [name, email, passwordHash, defaultRole];

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new user with ID:', result.rows[0].user_id);
    }

    return result.rows[0].user_id;
};

const findUserByEmail = async (email) => {
    const query = `
        SELECT user_id, name, email, password_hash, role_id
        FROM public.users
        WHERE email = $1
    `;
    const result = await db.query(query, [email]);

    return result.rows[0] ?? null;
};

const verifyPassword = (password, passwordHash) =>
    bcrypt.compare(password, passwordHash);

const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);

    if (!user || !(await verifyPassword(password, user.password_hash))) {
        return null;
    }

    const { password_hash, ...authenticatedUser } = user;
    return authenticatedUser;
};

export { createUser, authenticateUser };
