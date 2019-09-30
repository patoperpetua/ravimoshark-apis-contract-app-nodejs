"use strict";

import { getConnection } from "typeorm";
import { Clients as ClientsDB } from "../databases/entities";
import { DatabaseUtilities } from "../databases/utils/DatabaseUtils";
import { LoggerUtility } from "../utils/LoggerUtility";
import { ParametersComplete, Utilities } from "../utils/utilities";
import { VALID_RESPONSES } from "../utils/ValidResponses";

const SERVICE_NAME = "ClientsService";
export class ClientsService {

  /**
   * Get all clients.
   * Get all clients.
   *
   * skipParam Integer number of item to skip
   * limit Integer max records to return
   * orderBy String order by property. (optional)
   * filterBy String filter data. (optional)
   * deleted Deleted Get all, deleted, not deleted data. Default not deleted. (optional)
   * metadata Boolean If metadata is needed (for pagination controls) (optional)
   * returns inline_response_200
   */
  public static getClients(
    params: ParametersComplete
  ) {
    const FUNCTION_NAME = "get";
    return new Promise(async (resolve, reject) => {
      LoggerUtility.info(SERVICE_NAME, FUNCTION_NAME);
      const object = DatabaseUtilities.getFindObject(params, ClientsDB);
      if (!object) {
          LoggerUtility.warn(SERVICE_NAME, FUNCTION_NAME, "order param malformed", params.orderBy);
          reject(VALID_RESPONSES.ERROR.PARAMS.MALFORMED.ORDERBY);
          return;
      }
      LoggerUtility.info(SERVICE_NAME, FUNCTION_NAME, "with", object);
      const [accounts, total] = await getConnection().manager.findAndCount(ClientsDB, object);
      if (!accounts || !accounts.length) {
          LoggerUtility.warn(SERVICE_NAME, FUNCTION_NAME, "empty result");
          resolve();
          return;
      }
      LoggerUtility.info(SERVICE_NAME, FUNCTION_NAME, "got ", accounts.length);
      resolve(Utilities.getMetadataFormat(accounts, total, params));
      return;
  });
  }
}