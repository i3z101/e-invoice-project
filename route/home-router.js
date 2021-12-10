"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const home_controller_1 = require("../controller/home-controller");
const router = express_1.default.Router();
router.get('/', home_controller_1.homePage);
router.get('/test', home_controller_1.testPage);
exports.default = router;
