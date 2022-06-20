import smartpy as sp
import os
FA2 = sp.io.import_script_from_url("https://smartpy.io/templates/fa2_lib.py")
Utils = sp.io.import_script_from_url("https://raw.githubusercontent.com/RomarQ/tezos-sc-utils/main/smartpy/utils.py")


TTicketCollectionInfo = sp.TRecord(
  id = sp.TNat,
  owner = sp.TAddress,
  name = sp.TString,
  cover_image = sp.TString,
  datetime = sp.TNat,
  location = sp.TString,
  max_supply = sp.TNat,
  purchase_amount_mutez = sp.TMutez,
)

TCreateCollectionParams = sp.TRecord(
  name = sp.TString,
  cover_image = sp.TString,
  datetime = sp.TNat,
  location = sp.TString,
  max_supply = sp.TNat,
  purchase_amount_mutez = sp.TMutez,
)

TPurchaseTicketParams = sp.TRecord(
  collection_id=sp.TNat,
  quantity=sp.TNat
)

def mock_test_collection_params(
  name = "My Ticket Collection",
  cover_image = "ipfs://mocked-ipfs-uri",
  datetime = 1655673791, # Sun Jun 19 2022 21:23:11 GMT+0000
  max_supply = 1000,
  purchase_amount_mutez = sp.mutez(5),
  location = "My Location"
):
  return sp.record(
    name=name,
    cover_image=cover_image,
    datetime=datetime,
    max_supply=max_supply,
    purchase_amount_mutez=purchase_amount_mutez,
    location=location
  )


class DeTicketFA2(
  FA2.Admin,
  FA2.ChangeMetadata,
  FA2.WithdrawMutez,
  FA2.OnchainviewBalanceOf,
  FA2.Fa2Nft,
):
  def __init__(self, admin, metadata, token_metadata = {}, ledger = {}, policy = None, metadata_base = None):
    FA2.Fa2Nft.__init__(self, metadata, token_metadata = token_metadata, ledger = ledger, policy = policy, metadata_base = metadata_base)
    FA2.Admin.__init__(self, admin)
    self.update_initial_storage(
      last_ticket_collection_id=sp.nat(0),

      # Ticket Collection ID -> Ticket Collection
      ticket_collections=sp.big_map({}, tkey = sp.TNat, tvalue = TTicketCollectionInfo),

      # Ticket Collection ID -> Total Supply
      token_ticket_collections_supply=sp.big_map({}, tkey = sp.TNat, tvalue = sp.TNat),

      # Ticket Collection ID -> Balance (mutez)
      ticket_collection_balances=sp.big_map({}, tkey = sp.TNat, tvalue = sp.TMutez),

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
      cover_image=params.cover_image,
      datetime=params.datetime,
      max_supply=params.max_supply,
      purchase_amount_mutez=params.purchase_amount_mutez,
      location=params.location
    )
    self.data.token_ticket_collections_supply[ticket_collection_id] = 0
    self.data.ticket_collections[ticket_collection_id] = ticket_collection
    self.data.last_ticket_collection_id += 1

  @sp.entry_point
  def purchase_ticket(self, params):
    sp.set_type(params, TPurchaseTicketParams)
    collection_id = params.collection_id
    collection = sp.compute(self.data.ticket_collections[collection_id])
    total_amount = sp.mul(params.quantity, collection.purchase_amount_mutez)
    sp.verify(sp.amount >= total_amount, message="INSUFFICIENT_AMOUNT")
    current_collection_supply = self.data.token_ticket_collections_supply[collection_id]
    sp.verify(current_collection_supply + params.quantity <= collection.max_supply)
    with sp.for_("x", sp.range(0, params.quantity, step = 1)) as x:
      token_owner = sp.sender
      token_id = sp.compute(self.data.last_token_id)
      token_info_metadata = sp.map(l = {
        "decimals": sp.utils.bytes_of_string("0"),
        "symbol": sp.utils.bytes_of_string("DTK"),
        "name": Utils.Bytes.of_string(sp.concat([collection.name, " #", Utils.String.of_int(sp.to_int(token_id))])),
        "icon": sp.utils.bytes_of_string("ipfs://QmPyTq2y5krFPmcxWAGtnzphgB979q4kj9UddRYx8rWp8c"),
        "collection_id": Utils.Bytes.of_nat(collection_id),
      })
      metadata = sp.record(token_id=token_id, token_info=token_info_metadata)
      self.data.token_metadata[token_id] = metadata
      self.data.ledger[token_id] = token_owner
      self.data.token_ticket_collections[token_id] = collection_id
      self.data.token_ticket_collections_supply[collection_id] += 1
      collection_current_balance = self.data.ticket_collection_balances.get(collection_id, sp.mutez(0))
      self.data.ticket_collection_balances[collection_id] = collection_current_balance + collection.purchase_amount_mutez
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
    c.create_ticket_collection(mock_test_collection_params(purchase_amount_mutez=sp.mutez(5), name="Rock Show")).run(valid = True, sender = user)
    sc.verify(c.data.ticket_collections[0] == sp.record(
      id=sp.nat(0),
      owner=user.address,
      name="Rock Show",
      cover_image="ipfs://mocked-ipfs-uri",
      datetime=1655673791, # Sun Jun 19 2022 21:23:11 GMT+0000
      max_supply=1000,
      purchase_amount_mutez=sp.mutez(5),
      location="My Location"
    ))

  @sp.add_test(name="Test Purchase Tickets")
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
    c.create_ticket_collection(mock_test_collection_params(purchase_amount_mutez=sp.mutez(5), name="Rock Show")).run(valid =True, sender=eventOwner)
    sc.verify(~c.data.ticket_collection_balances.contains(0))
    # First Purchase
    c.purchase_ticket(
      sp.record(collection_id=0, quantity=1)
    ).run(
      valid=True,
      sender=buyer,
      amount=sp.mutez(5),
    )
    sc.verify(c.data.ledger[0] == buyer.address)
    sc.verify(c.data.ticket_collection_balances[0] == sp.mutez(5))
    # Second Purchase
    c.purchase_ticket(
      sp.record(collection_id=0, quantity=2)
    ).run(
      valid=True,
      sender=buyer,
      amount=sp.mutez(10),
    )
    sc.verify(c.data.ledger[1] == buyer.address)
    sc.verify(c.data.ledger[2] == buyer.address)
    sc.verify(c.data.ticket_collection_balances[0] == sp.mutez(15))
    # Purchase sending insufficient amount
    c.purchase_ticket(
      sp.record(collection_id=0, quantity=2)
    ).run(
      valid=False,
      exception="INSUFFICIENT_AMOUNT",
      sender=buyer,
      amount=sp.mutez(8),
    )

  @sp.add_test(name="Test Collection Max Supply")
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
    c.create_ticket_collection(mock_test_collection_params(purchase_amount_mutez=sp.mutez(5), name="Rock Show", max_supply=3)).run(valid =True, sender=eventOwner)
    sc.verify(~c.data.ticket_collection_balances.contains(0))
    # First Purchase
    c.purchase_ticket(
      sp.record(collection_id=0, quantity=1)
    ).run(
      valid=True,
      sender=buyer,
      amount=sp.mutez(5),
    )
    sc.verify(c.data.ledger[0] == buyer.address)
    sc.verify(c.data.ticket_collection_balances[0] == sp.mutez(5))
    # Second Purchase
    c.purchase_ticket(
      sp.record(collection_id=0, quantity=2)
    ).run(
      valid=True,
      sender=buyer,
      amount=sp.mutez(10),
    )
    sc.verify(c.data.ledger[1] == buyer.address)
    sc.verify(c.data.ticket_collection_balances[0] == sp.mutez(15)) 
    # Third Purchase (Exceeds Collection Max Supply)
    c.purchase_ticket(
      sp.record(collection_id=0, quantity=1)
    ).run(
      valid=False,
      sender=buyer,
      amount=sp.mutez(5),
    )

sp.add_compilation_target(
    "de_ticket_nft_tokens",
    DeTicketFA2(
      admin = sp.address(os.getenv("ADMIN_ADDRESS")),
      metadata = sp.utils.metadata_of_url("http://example.com"),
    )
)
