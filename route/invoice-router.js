"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invoice_controller_1 = require("../controller/invoice-controller");
const router = express_1.default.Router();
router.post('/generate-invoice', invoice_controller_1.generateInvoice);
router.get('/download-invoice', invoice_controller_1.downloadInvoice);
exports.default = router;
