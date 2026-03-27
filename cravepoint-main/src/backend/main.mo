import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";



actor {
  type Order = {
    id : Text;
    items : [(Text, Nat)];
    status : OrderStatus;
    customer : Principal;
    timestamp : Nat;
  };

  type OrderStatus = {
    #ordered;
    #preparing;
    #readyForPickup;
    #reviewed;
  };

  let orders = Map.empty<Text, Order>();
  var staffPassword = "cafeteria2024";

  public shared ({ caller }) func placeOrder(items : [(Text, Nat)]) : async Text {
    if (items.size() == 0) { Runtime.trap("Order must contain at least one item") };

    let id = caller.toText() # "." # orders.size().toText();

    let order : Order = {
      id;
      items;
      status = #ordered;
      customer = caller;
      timestamp = Int.abs(Time.now());
    };

    orders.add(id, order);
    id;
  };

  public query ({ caller }) func getOrderStatus(orderId : Text) : async OrderStatus {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order.status };
    };
  };

  public shared ({ caller }) func staffUpdateOrderStatus(orderId : Text, status : OrderStatus, password : Text) : async () {
    if (password != staffPassword) { Runtime.trap("Invalid staff password") };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = { order with status };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func staffLogin(password : Text) : async Bool {
    password == staffPassword;
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.values().toArray();
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    orders.values().toArray().filter(
      func(order) {
        order.customer == caller;
      }
    );
  };

  public shared ({ caller }) func changeStaffPassword(oldPassword : Text, newPassword : Text) : async () {
    if (oldPassword != staffPassword) { Runtime.trap("Invalid current password") };
    staffPassword := newPassword;
  };
};
