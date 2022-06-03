import smartpy as sp
import os
FA2 = sp.io.import_script_from_url("https://smartpy.io/templates/fa2_lib.py")


TTicketCollectionInfo = sp.TRecord(
  id = sp.TNat,
  owner = sp.TAddress,
)

class DeTicketFA2(
  FA2.Admin,
  FA2.ChangeMetadata,
  FA2.WithdrawMutez,
  FA2.OnchainviewBalanceOf,
  FA2.Fa2Nft,
  FA2.OffchainViewsNft,
):
  def __init__(self, admin, metadata, token_metadata = {}, ledger = {}, policy = None, metadata_base = None):
    FA2.Fa2Nft.__init__(self, metadata, token_metadata = token_metadata, ledger = ledger, policy = policy, metadata_base = metadata_base)
    FA2.Admin.__init__(self, admin)
    self.update_initial_storage(
      last_ticket_collection_id=sp.nat(0),
      ticket_collections=sp.big_map({}, tkey = sp.TNat, tvalue = TTicketCollectionInfo)
    )

  @sp.entry_point
  def create_ticket_collection(self):
    ticket_collection_id = sp.compute(self.data.last_ticket_collection_id)
    ticket_collection = sp.record(
      id=ticket_collection_id,
      owner=sp.sender,
    )
    self.data.ticket_collections[ticket_collection_id] = ticket_collection
    self.data.last_ticket_collection_id += 1


  @sp.add_test(name="Test Create Ticket Collection")
  def test():
    sc = sp.test_scenario()
    admin = sp.test_account("Contract Admin")
    user = sp.test_account("User")
    c = DeTicketFA2(
      admin = admin.address,
      metadata=sp.big_map(l = {
        "name" : sp.utils.bytes_of_string("My deTicket NFTs"),
      })
    )
    sc += c
    sc.verify(c.data.administrator == admin.address)
    sc.verify(c.data.last_ticket_collection_id == 0)
    c.create_ticket_collection().run(valid = True, sender = user)
    sc.verify(c.data.ticket_collections[0] == sp.record(
      id=sp.nat(0),
      owner=user.address,
    ))
