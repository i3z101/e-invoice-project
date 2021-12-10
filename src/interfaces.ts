export interface ResponseInterface {
    message: string;
    statusCode: number
}

export interface ItemsInterface {
    item: string,
    qnty: number,
    pricePerUnit: number
}

export interface TextOptionsInterface {
    align?: string
    baseline?: number,
    bulletIndent?: number,
    bulletRadius?: number,
    characterSpacing?: number,
    columnGap?: number,
    columns?: number,
    continued?: boolean,
    destination?: string,
    ellipsis?: true,
    features?: PDFKit.Mixins.OpenTypeFeatures[],
    fill?: boolean,
    goTo?: string,
    height?: number,
    indent?: number,
    lineBreak?: boolean,
    lineGap?: number,
    link?: string,
    oblique?: number | boolean,
    paragraphGap?: number,
    strike?: boolean,
    stroke?: boolean,
    textIndent?: number,
    underline?: boolean,
    width?: number,
    wordSpacing?: number
}

export interface ImageOptionsInterface {
    destination?: string,
    height?: number,
    scale?: number,
    width?: number
}

export interface UploadInvoiceBodyRequestInterface {
    status: string,
    existBillNo?: number,
    listItems?: ItemsInterface[]
}

export interface DownloadInvoiceBodyRequestInterface {
    billNo: number
}