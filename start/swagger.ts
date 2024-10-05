/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import AutoSwagger from "adonis-autoswagger";
import swagger from "#config/swagger";

// returns swagger in YAML
router.get("/docs", async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger);
});

// Renders Swagger-UI and passes YAML-output of /swagger
router.get("/swagger", async () => {
  // return AutoSwagger.default.ui("/docs", swagger);
  return AutoSwagger.default.scalar("/docs"); //to use Scalar instead
  // return AutoSwagger.default.rapidoc("/docs", "view"); //to use RapiDoc instead (pass "view" default, or "read" to change the render-style)
});


