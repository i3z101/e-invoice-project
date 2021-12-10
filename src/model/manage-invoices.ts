import {GetObjectCommandOutput, S3} from '@aws-sdk/client-s3';
import { Response } from 'express';
import { Readable } from 'stream';
import { ResponseInterface } from '../interfaces';


class S3Invoice {
    private s3VersionApi: string;
    private region: string;
    private accessKeyId: string;
    private secretAccessKey: string;
    private bucketName: string;
    private s3Client;

    constructor(s3VersionAPi: string, region: string, accessKeyId: string, secretAccessKey: string, bucketName: string) {
        this.s3VersionApi= s3VersionAPi.trim();
        this.region = region.trim();
        this.accessKeyId = accessKeyId.trim();
        this.secretAccessKey = secretAccessKey.trim();
        this.bucketName = bucketName.trim();
        this.s3Client = new S3({
            apiVersion: this.s3VersionApi,
            region: this.region,
            credentials: {
                accessKeyId: this.accessKeyId,
                secretAccessKey: this.secretAccessKey
            }
        })
    }

    uploadInvoice = async (invoice: any, invoiceName: number): Promise<ResponseInterface> => {
        try {
            await this.s3Client.putObject({
                Bucket: this.bucketName,
                Body: invoice,
                Key: invoiceName.toString() + '.pdf',
                ACL: 'public-read',
                ContentType:'application/pdf',
            });

            return {
                message: "File uploaded successfully",
                statusCode: 201
            }

        }catch(err: any) {
            throw new Error(err);
        }
    }

    downloadInvoice = async (res: Response, invoiceName: number): Promise<ResponseInterface> => {
        try {
                const downloadedFile: GetObjectCommandOutput = await this.s3Client.getObject({
                        Bucket: this.bucketName,
                        Key: `${invoiceName}.pdf`
                    }
                    );

                if(downloadedFile.Body instanceof Readable) {
                    res.attachment(`${invoiceName}.pdf`);
                    downloadedFile.Body.pipe(res);
                    res.send(downloadedFile.Body)
                }
                return {
                    message: "File donwloded successfully",
                    statusCode: 200
                }
        }catch(err: any) {
            throw new Error(err);
        }
    }
}

export default S3Invoice