import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    name: string;
    companyName?: string;
    role?: 'ADMIN' | 'CLIENT';
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        companyName: data.companyName,
        role: data.role || 'CLIENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        role: true,
        status: true,
        credits: true,
        planId: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user);

    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        plan: true,
      },
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('Conta desativada ou suspensa');
    }

    const token = this.generateToken(user);

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        plan: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        role: true,
        status: true,
        credits: true,
        planId: true,
        plan: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  private generateToken(user: any): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}