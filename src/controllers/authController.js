const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone, address, preferredLanguage } = req.body;

    const existingUser = await User.findOne({
      where: {
        email: email.toLowerCase()
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: req.t('auth.emailExists'),
        code: 'EMAIL_EXISTS'
      });
    }

    const existingUsername = await User.findOne({
      where: { username }
    });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: req.t('auth.usernameExists'),
        code: 'USERNAME_EXISTS'
      });
    }

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      full_name: fullName,
      phone,
      address,
      preferred_language: preferredLanguage || 'en'
    });

    const { accessToken, refreshToken } = generateTokens(user);

    await user.update({ refresh_token: refreshToken });

    res.status(201).json({
      success: true,
      message: req.t('auth.registerSuccess'),
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: req.t('auth.invalidCredentials'),
        code: 'INVALID_CREDENTIALS'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: req.t('auth.unauthorized'),
        code: 'ACCOUNT_DISABLED'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: req.t('auth.invalidCredentials'),
        code: 'INVALID_CREDENTIALS'
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    await user.update({
      last_login: new Date(),
      refresh_token: refreshToken
    });

    res.json({
      success: true,
      message: req.t('auth.loginSuccess'),
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const logout = async (req, res) => {
  try {
    if (req.user) {
      await req.user.update({ refresh_token: null });
    }

    res.json({
      success: true,
      message: req.t('auth.logoutSuccess')
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: req.t('common.required'),
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: req.t('auth.invalidCredentials'),
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    const user = await User.findByPk(decoded.id);

    if (!user || !user.is_active || user.refresh_token !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: req.t('auth.invalidCredentials'),
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    const tokens = generateTokens(user);

    await user.update({ refresh_token: tokens.refreshToken });

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: req.t('auth.tokenExpired'),
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: { user: req.user.toJSON() }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, preferredLanguage } = req.body;

    await req.user.update({
      full_name: fullName,
      phone,
      address,
      preferred_language: preferredLanguage
    });

    res.json({
      success: true,
      message: req.t('profile.updateSuccess'),
      data: { user: req.user.toJSON() }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const isMatch = await req.user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: req.t('profile.wrongPassword'),
        code: 'WRONG_PASSWORD'
      });
    }

    await req.user.update({ password: newPassword });

    res.json({
      success: true,
      message: req.t('profile.passwordChanged')
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError'),
      code: 'SERVER_ERROR'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword
};