import {getRequestConfig} from "next-intl/server";
import {resolveRequestLocale} from "./server";

export default getRequestConfig(async ({requestLocale}) => {
  const requestedLocale = await requestLocale;
  const locale = await resolveRequestLocale(requestedLocale);

  return {
    locale,
  };
});
