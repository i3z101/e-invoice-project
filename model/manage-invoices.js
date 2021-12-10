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
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const stream_1 = require("stream");
class S3Invoice {
    constructor(s3VersionAPi, region, accessKeyId, secretAccessKey, bucketName) {
        this.uploadInvoice = (invoice, invoiceName) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.s3Client.putObject({
                    Bucket: this.bucketName,
                    Body: invoice,
                    Key: invoiceName.toString() + '.pdf',
                    ACL: 'public-read',
                    ContentType: 'application/pdf',
                });
                return {
                    message: "File uploaded successfully",
                    statusCode: 201
                };
            }
            catch (err) {
                throw new Error(err);
            }
        });
        this.downloadInvoice = (res, invoiceName) => __awaiter(this, void 0, void 0, function* () {
            try {
                const downloadedFile = yield this.s3Client.getObject({
                    Bucket: this.bucketName,
                    Key: `${invoiceName}.pdf`
                });
                if (downloadedFile.Body instanceof stream_1.Readable) {
                    res.attachment(`${invoiceName}.pdf`);
                    downloadedFile.Body.pipe(res);
                    res.send(downloadedFile.Body);
                }
                return {
                    message: "File donwloded successfully",
                    statusCode: 200
                };
            }
            catch (err) {
                throw new Error(err);
            }
        });
        this.s3VersionApi = s3VersionAPi.trim();
        this.region = region.trim();
        this.accessKeyId = accessKeyId.trim();
        this.secretAccessKey = secretAccessKey.trim();
        this.bucketName = bucketName.trim();
        this.s3Client = new client_s3_1.S3({
            apiVersion: this.s3VersionApi,
            region: this.region,
            credentials: {
                accessKeyId: this.accessKeyId,
                secretAccessKey: this.secretAccessKey
            }
        });
    }
}
exports.default = S3Invoice;
