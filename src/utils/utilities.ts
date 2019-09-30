import { Reviewed } from "src/models/reviewed";
import { Valid } from "src/models/valid";
import { SwaggerRequestParameters } from "swagger-tools";
import { Deleted } from "../models";
import { Metadata } from "../models/metadata";
import { CustomResponse } from "./customsHandlers";
import { VALID_RESPONSES } from "./ValidResponses";
import { ResponsePayload } from "./writer";

export class Utilities {
    public static checkVariableNotNull(name: string, parameters: SwaggerRequestParameters, res?: CustomResponse): any {
        let error: boolean = true;
        let value = null;
        if (parameters[name]) {
            value = parameters[name].value;
            error = false;
            // LoggerUtility..info(name,"=",value);
        }
        if (res && error) {
            this.sendError(res, name);
        }
        return value;
    }

    public static checkVariablesNotNull(
            names: Array<string>, parameters: SwaggerRequestParameters, res?: CustomResponse): any {
        const responses = {};
        for (const name of names) {
            const parameter = this.checkVariableNotNull(name, parameters, res);
            if (!parameter) {
                return null;
            }
            responses[name] = parameter;
        }
        return responses;
    }
    public static checkId(parameters: SwaggerRequestParameters, res?: CustomResponse): number | null {
        return this.checkVariableNotNull("id", parameters, res);
    }

    public static checkDeleted(parameters: SwaggerRequestParameters, res?: CustomResponse): Deleted | null {
        return this.checkVariableNotNull("deleted", parameters, res);
    }

    public static checkFilter(parameters: SwaggerRequestParameters, res?: CustomResponse): string | null {
        return this.checkVariableNotNull("filter", parameters, res);
    }

    public static checkAndDelete(
            parameters: SwaggerRequestParameters, idName?: string, res?: CustomResponse): ParametersIdDeleted | null {
        const response: ParametersIdDeleted = {
            deleted: this.checkDeleted(parameters),
            id: this.checkVariableNotNull(idName, parameters),
            idUser: this.checkVariableNotNull("idUser", parameters)
        };
        if (!response.deleted || (response.id !== 0 && !response.id)) {
            return null;
        }
        return response;
    }

    public static checkIdAndDelete(
            parameters: SwaggerRequestParameters, res?: CustomResponse): ParametersIdDeleted | null {
        return this.checkAndDelete(parameters, "id", res);
    }

    public static checkAllParametersGet(
            parameters: SwaggerRequestParameters, res?: CustomResponse): ParametersComplete | null {
        const error = false;
        const response: ParametersComplete = {
            deleted: this.checkDeleted(parameters),
            filter: this.checkVariableNotNull("filter", parameters),
            id: this.checkId(parameters),
            limit: this.checkVariableNotNull("limit", parameters),
            metadata: this.checkVariableNotNull("metadata", parameters),
            orderBy: this.checkVariableNotNull("orderBy", parameters),
            reviewed: this.checkVariableNotNull("reviewed", parameters),
            skip: this.checkVariableNotNull("skip", parameters),
            valid: this.checkVariableNotNull("valid", parameters)
        };
        if (!response.skip || response.skip < 0) {
            response.skip = 0;
        }
        if (!response.limit || response.limit < 0) {
            response.limit = 10;
        }
        // TODO: check if any variable is null.
        if (res && error) {
            this.sendError(res);
        }
        return response;
    }

    public static addDeletedParam(deleted: Deleted, params: any): object {
        if (!params) {
            params = {};
        }
        switch (deleted) {
            case Deleted.ALL:
                break;
            case Deleted.DELETED:
                params.deleted = true;
                break;
            case Deleted.ACTIVE:
                params.deleted = false;
                break;
        }
        return params;
    }
    public static getMetadataFormat(
        items: Array<any>, total: number, params: ParametersComplete) {
        let metadata: Metadata = null;
        if (params.metadata === true) {
            metadata = {
                first: 0
                , last: total
                , next: params.skip + params.limit
                , prev: params.skip - params.limit
                , self: params.skip
            };
            if (metadata.prev < 0) {
                metadata.prev = 0;
            }
            if (metadata.next > metadata.last) {
                metadata.next = -1;
            }
        }
        return { metadata, items };
    }

    public static checkUrl(url: string): boolean {
        const pattern = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
        return pattern.test(url);
    }

    private static sendError(res: CustomResponse, text?: string) {
        ResponsePayload.response400(res, VALID_RESPONSES.ERROR.PARAMS.MISSING + " " + text);
    }
}
export interface ParametersIdDeleted {
    id: number | null;
    deleted: Deleted | null;
    idUser?: number | null;
}

export interface ParametersComplete extends ParametersIdDeleted {
    skip: number | null;
    limit: number | null;
    orderBy: string | null;
    filter: string | null;
    metadata: boolean | null;
    valid?: Valid | null;
    reviewed?: Reviewed | null;
}
