const { StatusCodes } = require("http-status-codes");
const authService = require("../services/auth-service");

class AuthController {
  async signup(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const result = await authService.signup(email, password);

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "User created successfully",
        data: result,
      });
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const result = await authService.login(email, password);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AuthController();
