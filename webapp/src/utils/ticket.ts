const TICKET_TYPES: {
  [key: string]: string,
} = {
  ADMIT_ONE: 'Admit One',
  MEMBERSHIP: 'Membership',
  SEASON_PASS: 'Season Pass',
}

export const getTicketTypeLabel = (ticketType: string): string => TICKET_TYPES[ticketType]
