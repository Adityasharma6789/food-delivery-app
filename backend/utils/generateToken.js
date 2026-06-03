import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'swiftbite_super_secret_jwt_key_987654321', {
    expiresIn: '30d'
  });
};

export default generateToken;
