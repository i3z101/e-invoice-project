import request from 'supertest';
import app from '../index';

// const request = require('supertest');
// import invoiceRouter from '../route/invoice-router';

describe("Test generate-rinvoice route", ()=> {

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

    test('TC004 - RETURN 201 STATUS CODE WHEN GENERATE PDF DOCUMENT SUCCESSFULLY & UPLOAD IT INTO THE BUCKET', async() => {
        const response = await request(app).post('/api/v1/generate-invoice').send({
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
    })
})

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