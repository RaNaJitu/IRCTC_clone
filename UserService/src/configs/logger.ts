import winston  from "winston"
import { env } from "./env";

// exportconst logger = winston.createLogger({
//     level:env.LOG_LEVEL,
//     defaultMeta:{},
//     format: winston.format.combine(
//         winston.format.timestamp(),
//         winston.format.printf(({level,message,timestamp,server})=>{
//             return `[${timestamp}] [${level}] [${server}] [${message}]`
//         })
//     ),
//     transports:[new winston.transports.Console()]
// })

// export const LOGGER = winston.createLogger({
//   level: env.LOG_LEVEL,
//   defaultMeta: {
//     service: "UserService",
//   },
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.errors({ stack: true }),
//     winston.format.printf(({ timestamp, level, message, service, stack, metadata }) => {
//       // return stack
//       //   ? `[${timestamp}] [${level}] [${service}] ${stack}`
//       //   : `[${timestamp}] [${level}] [${service}] ${message} ${
//       //       Object.keys(metadata).length ? JSON.stringify(metadata) : ""
//       //     }`;
//       return `[${timestamp}] [${level}] [${service}] [${message}]`;
//       // return stack
//       //   ? `[${timestamp}] [${level}] [${service}] ${stack}`
//       //   : `[${timestamp}] [${level}] [${service}] ${message}`;
//     })
//   ),
//   transports: [new winston.transports.Console()],
// });


const myFormat = winston.format.printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

export const LOGGER = winston.createLogger({
  level: 'info',
  defaultMeta: {
    service: "UserService",
  },
  format: winston.format.combine(
    winston.format.label({ label: 'UserService' }),
    winston.format.timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({ filename: 'combined.log' })
  ]
});