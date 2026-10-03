import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, companyName, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, senha e nome são obrigatórios',
      });
    }

    const result = await authService.register({
      email,
      password,
      name,
      companyName,
      role,
    });

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao registrar usuário',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios',
      });
    }

    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Erro ao fazer login',
    });
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await authService.getUserById(req.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || 'Erro ao buscar perfil',
    });
  }
};