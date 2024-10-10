import path from "node:path";
import url from "node:url";
import env from '#start/env';

export default {
  path: path.dirname(url.fileURLToPath(import.meta.url)) + "/../",
  tagIndex: 2,
  info: {
    title: "User Managament",
    version: "1.0.0",
    description: "This is a User Managament project",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  snakeCase: true,
  debug: env.get('DEBUG'), // set to true, to get some useful debug output
  ignore: ["/swagger", "/scalar", "/rapidoc", "/docs", "/admin/*","/admin"],
  preferredPutPatch: "PUT", // if PUT/PATCH are provided for the same route, prefer PUT
  common: {
    parameters: {}, // OpenAPI conform parameters that are commonly used
    headers: {}, // OpenAPI conform headers that are commonly used
  },
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    }
  },
  defaultSecurityScheme: "BearerAuth", // optional
  persistAuthorization: true, // persist authorization between reloads on the swagger page
  showFullPath: true, // the path displayed after endpoint summary
};

