"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invoice_router_1 = __importDefault(require("./route/invoice-router"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/v1', invoice_router_1.default);
app.listen(5000, () => {
    console.log("Hello from server");
});
