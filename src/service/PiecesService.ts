"use strict";

import { getConnection } from "typeorm";
import { Pieces as PiecesDB } from "../databases/entities";
import { DatabaseUtilities } from "../databases/utils/DatabaseUtils";
import { LoggerUtility } from "../utils/LoggerUtility";
import { ParametersComplete, Utilities } from "../utils/utilities";
import { VALID_RESPONSES } from "../utils/ValidResponses";

const SERVICE_NAME = "PiecesService";
export class PiecesService {
  /**
   * Get all pieces.
   * Get all pieces.
   *
   * skipParam Integer number of item to skip
   * limit Integer max records to return
   * orderBy String order by property. (optional)
   * filterBy String filter data. (optional)
   * deleted Deleted Get all, deleted, not deleted data. Default not deleted. (optional)
   * metadata Boolean If metadata is needed (for pagination controls) (optional)
   * returns inline_response_200
   */
  public static get(params: ParametersComplete) {
    const FUNCTION_NAME = "get";
    const logHeader = `${SERVICE_NAME}: ${FUNCTION_NAME} -`;
    return new Promise(async (resolve, reject) => {
      LoggerUtility.info(`${logHeader}`);
      const object = DatabaseUtilities.getFindObject(params, PiecesDB);
      if (!object) {
          LoggerUtility.warn(`${logHeader} order param malformed`, params.orderBy);
          reject(VALID_RESPONSES.ERROR.PARAMS.MALFORMED.ORDERBY);
          return;
      }
      LoggerUtility.info(`${logHeader} with`, object);
      const [accounts, total] = await getConnection().manager.findAndCount(PiecesDB, object);
      if (!accounts || !accounts.length) {
          LoggerUtility.warn(SERVICE_NAME, FUNCTION_NAME, "empty result");
          resolve();
          return;
      }
      LoggerUtility.info(`${logHeader} got ${accounts.length}`);
      resolve(Utilities.getMetadataFormat(accounts, total, params));
      return;
  });
  }
}
