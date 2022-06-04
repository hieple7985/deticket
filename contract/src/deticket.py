import smartpy as sp
import os
FA2 = sp.io.import_script_from_url("https://smartpy.io/templates/fa2_lib.py")
Utils = sp.io.import_script_from_url("https://raw.githubusercontent.com/RomarQ/tezos-sc-utils/main/smartpy/utils.py")


TTicketCollectionInfo = sp.TRecord(
  id = sp.TNat,
  owner = sp.TAddress,
  name = sp.TString,
  purchase_amount_mutez = sp.TMutez
)

TCreateCollectionParams = sp.TRecord(
  name = sp.TString,
  purchase_amount_mutez = sp.TMutez
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

      # Ticket Collection ID -> Ticket Collection
      ticket_collections=sp.big_map({}, tkey = sp.TNat, tvalue = TTicketCollectionInfo),

      # Token ID -> Ticket Collection ID
      token_ticket_collections=sp.big_map({}, tkey = sp.TNat, tvalue = sp.TNat),
    )

  @sp.entry_point
  def create_ticket_collection(self, params):
    sp.set_type(params, TCreateCollectionParams)
    ticket_collection_id = sp.compute(self.data.last_ticket_collection_id)
    ticket_collection = sp.record(
      id=ticket_collection_id,
      owner=sp.sender,
      name=params.name,
      purchase_amount_mutez=params.purchase_amount_mutez
    )
    self.data.ticket_collections[ticket_collection_id] = ticket_collection
    self.data.last_ticket_collection_id += 1

  @sp.entry_point
  def purchase_tickets(self, batch):
    """Any user can purchase new or existing tokens."""
    with sp.for_("action", batch) as action:
      collection_id = action.collection_id
      token_owner = sp.sender
      token_id = sp.compute(self.data.last_token_id)
      collection = sp.compute(self.data.ticket_collections[collection_id])
      token_info_metadata = sp.map(l = {
        "decimals": sp.utils.bytes_of_string("0"),
        "symbol": sp.utils.bytes_of_string("DTK"),
        "name": Utils.Bytes.of_string(sp.concat([collection.name, " #", Utils.String.of_int(sp.to_int(token_id))])),
        "icon": sp.utils.bytes_of_string("ipfs://QmPyTq2y5krFPmcxWAGtnzphgB979q4kj9UddRYx8rWp8c"),
        "collection_id": sp.pack(collection.id),
      })
      metadata = sp.record(token_id=token_id, token_info=token_info_metadata)
      self.data.token_metadata[token_id] = metadata
      self.data.ledger[token_id] = token_owner
      self.data.token_ticket_collections[token_id] = collection_id
      self.data.last_token_id += 1


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
    c.create_ticket_collection(sp.record(purchase_amount_mutez=sp.mutez(5), name="Rock Show")).run(valid = True, sender = user)
    sc.verify(c.data.ticket_collections[0] == sp.record(
      id=sp.nat(0),
      owner=user.address,
      name="Rock Show",
      purchase_amount_mutez=sp.mutez(5)
    ))

  @sp.add_test(name="Test Purchase One Ticket")
  def test():
    sc = sp.test_scenario()
    admin = sp.test_account("Contract Admin")
    eventOwner = sp.test_account("Event Owner")
    buyer = sp.test_account("Buyer")
    c = DeTicketFA2(
      admin = admin.address,
      metadata=sp.big_map(l = {
        "name" : sp.utils.bytes_of_string("My deTicket NFTs"),
      })
    )
    sc += c
    sc.verify(c.data.administrator == admin.address)
    sc.verify(c.data.last_ticket_collection_id == 0)
    c.create_ticket_collection(sp.record(purchase_amount_mutez=sp.mutez(5), name="Rock Show")).run(valid =True, sender=eventOwner)
    # res = c.purchase_tickets([sp.record(collection_id=0)]).run(valid=False, exception="Ops", sender=buyer)
    # sc.verify(c.data.ticket_collections[0] == sp.record(
    #   id=sp.nat(0),
    #   owner=user.address,
    #   purchase_amount_mutez=sp.mutez(5)
    # ))

sp.add_compilation_target(
    "de_ticket_nft_tokens",
    DeTicketFA2(
      admin = sp.address(os.getenv("ADMIN_ADDRESS")),
      metadata = sp.utils.metadata_of_url("http://example.com"),
    )
)
