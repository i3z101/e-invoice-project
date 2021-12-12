"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
// const request = require('supertest');
// import invoiceRouter from '../route/invoice-router';
describe("Test generate-rinvoice route", () => {
    // test('TC001 - RETURN 404 STATUS CODE IF THERE IS NO STATUS PROPERY', async() => {
    //     const response = await request(app).post('/api/v1/generate-invoice').send({
    //         listItems: []
    //     });
    //     expect(response.body.statusCode).toBe(404);
    // }) 
    // test('TC002 - RETURN 404 STATUS CODE IF THERE IS NO LIST ITEMS PROPERY', async() => {
    //     const response = await request(app).post('/api/v1/generate-invoice').send({
    //         status: "Paid",
    //     });
    //     expect(response.body.statusCode).toBe(404);
    // })
    // test('TC003 - RETURN 500 STATUS CODE WHEN WHEN FAIL TO CENNECT TO S3 BUCKET', async() => {
    //     const response = await request(app).post('/api/v1/generate-invoice').send({
    //         status: "Paid",
    //         listItems: []
    //     });
    //     expect(response.body.statusCode).toBe(500);
    // })
    test('TC004 - RETURN 201 STATUS CODE WHEN GENERATE PDF DOCUMENT SUCCESSFULLY & UPLOAD IT INTO THE BUCKET', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default).post('/api/v1/generate-invoice').send({
            status: "Paid",
            listItems: [
                {
                    item: "Nike shoes",
                    qnty: 220,
                    pricePerUnit: 100
                }
            ]
        });
        expect(response.body.statusCode).toBe(201);
    }));
});
// describe("Test download-invoice route", ()=> {
//     test("TC-005 - RETURN 404 SATUS CODE IF THER IS NO BILL NO PROPERRTY", async()=> {
//         const respone = await request(app).get('/api/v1/download-invoice').send({});
//         expect(respone.body.statusCode).toBe(404);
//     })
//     test("TC-006 - RETURN 200 SATUS CODE IF THER IS  BILL NO PROPERRTY", async()=> {
//         const respone = await request(app).get('/api/v1/download-invoice').send({
//             billNo: 100200300
//         });
//         expect(respone.body.statusCode).toBe(200);
//     })
// })
