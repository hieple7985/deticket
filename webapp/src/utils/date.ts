import moment from "moment";

const FORMAT_PATTERN = "MMMM DD, h:mm A"

export const formatTicketDate = (date: number | string): string => {
  if (typeof date == 'number') {
    return moment.unix(date).format(FORMAT_PATTERN);
  }
  return moment(date).format(FORMAT_PATTERN);
}
