import { FastifyPluginAsync } from "fastify";

import { login, logout, me, refreshToken, register, SEND_OTP, VERIFY_OTP } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { verifyOTP } from "../../utils/otp";

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/register",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Register User",
        body: {
          type: "object",

          required: ["firstName", "lastName", "email", "password"],
          properties: {
            firstName: {
              type: "string",
            },

            lastName: {
              type: "string",
            },

            email: {
              type: "string",
            },

            password: {
              type: "string",
            },
          },
        },
      },
    },
    register
  );

  fastify.post(
    "/login",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Login User",
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
            },
            password: {
              type: "string",
            },
          },
        },
      },
    },
    login
  );

  fastify.get(
    "/me",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Authentication"],
        summary: "Get Current User",
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    me
  );

  /**
   * 1. Verify JWT
   * 2. Load session
   * 3. Validate session
   * 4. Compare refreshTokenHash
   * 5. Load user
   * 6. Generate new access token
   * 7. Generate new refresh token
   * 8. Rotate session
   * 9. Return tokens
   */
  
  fastify.post(
    "/refresh",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Refresh access token",
      },
    },
    refreshToken
  );

/**
 * 1. Access Token
 * 2. Authenticate User 
 * 3. Receive Refresh Token 
 * 4. Verify Refresh Token
 * 5. Find Session
 * 6. Revoke Session 
 * 7. Return Success
 */

fastify.post(
  "/logout",
  {
    preHandler: authenticate,
    schema: {
      tags: ["Authentication"],
      summary: "Logout current session",
      body: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: {
            type: "string",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  },
  logout
);


  /**
   * Logout All Devices
   * 1. Access Token
   * 2. Authenticate
   * 3. Extract userId
   * 4. Revoke Every Session
   */

  // fastify.post(
  //   "/logout-all",
  //   {
  //   preHandler:authenticate,
  //   schema:{
  //   tags:["Authentication"],
  //   summary:"Logout"
  //   }
  //   },
  //   logout
  //   );

    fastify.post(
      "/send-otp",
      {
      // preHandler:authenticate,
      schema: {
        tags: ["Authentication"],
        summary: "send OPT in given email of the User",
        body: {
          type: "object",

          required: ["firstName", "lastName", "email", "password", "confirmPassword"],
          properties: {
            firstName: {
              type: "string",
            },

            lastName: {
              type: "string",
            },

            email: {
              type: "string",
            },

            password: {
              type: "string",
            },

            confirmPassword: {
              type: "string",
            },
          },
        },
      },
      },
      SEND_OTP
    );


    fastify.post(
      "/verify-otp",
      {
      // preHandler:authenticate,
      schema: {
        tags: ["Authentication"],
        summary: "Verify OTP for user",
        body: {
          type: "object",

          required: ["otp"],
          properties: {
            otp: {
              type: "string",
            },
          },
        },
      },
      },
      VERIFY_OTP
    );
};

export default authRoutes;
