import smartpy as sp
import os
FA2 = sp.io.import_script_from_url("https://smartpy.io/templates/fa2_lib.py")


TicketInfo = sp.TRecord(
  id = sp.TNat,
  metadataURI = sp.TString
)

class DeTicketFA2(
  FA2.Admin,
  FA2.ChangeMetadata,
  FA2.WithdrawMutez,
  FA2.MintNft,
  FA2.OnchainviewBalanceOf,
  FA2.Fa2Nft,
  FA2.OffchainViewsNft,
):
  def __init__(self, admin, metadata, token_metadata = {}, ledger = {}, policy = None, metadata_base = None):
    FA2.Fa2Nft.__init__(self, metadata, token_metadata = token_metadata, ledger = ledger, policy = policy, metadata_base = metadata_base)
    FA2.Admin.__init__(self, admin)
    self.update_initial_storage(
      tickets = sp.big_map({}, tkey = sp.TString, tvalue = TicketInfo)
    )

  @sp.entry_point
  def mint(self, batch):
      """Admin can mint new or existing tokens."""
      # sp.verify(self.is_administrator(sp.sender), "FA2_NOT_ADMIN")
      sp.verify(sp.amount >= sp.tez(1), message="The sender does not own enough tz.")
      with sp.for_("action", batch) as action:
          token_id = sp.compute(self.data.last_token_id)
          metadata = sp.record(token_id=token_id, token_info=action.metadata)
          self.data.token_metadata[token_id] = metadata
          self.data.ledger[token_id] = action.to_
          self.data.last_token_id += 1

# A a compilation target (produces compiled code)
sp.add_compilation_target(
    "de_ticket_nft_tokens",
    DeTicketFA2(
      admin = sp.address(os.getenv("ADMIN_ADDRESS")),
      metadata = sp.utils.metadata_of_url(os.getenv("METADATA_URL")),
    )
)
