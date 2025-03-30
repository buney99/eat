import { useState } from "react";

const menu = {
  "飲料 / Drinks": [
    { name: "濃縮咖啡 / Espresso" },
    { name: "美式咖啡 / Americano" },
    { name: "拿鐵咖啡 / Latte" },
    { name: "榛果咖啡 / Hazelnut" },
    { name: "燕麥奶咖啡 / Oat Milk Coffee" },
    { name: "燕麥奶榛果咖啡 / Oat Milk Hazelnut Coffee" },
    { name: "紅茶 / Black Tea" },
    { name: "綠茶 / Green Tea" },
    { name: "烏龍茶 / Oolong Tea" },
    { name: "伯爵茶 / Earl Grey Tea" },
    { name: "奶茶 / Milk Tea" },
    { name: "檸檬紅茶 / Lemon Tea" },
    { name: "柚子茶 / Pomelo Tea" }
  ],
  "牛奶 / Milk & 燕麥奶 / Oat Milk": [
    { name: "牛奶 / Milk" },
    { name: "巧克力牛奶 / Chocolate Milk" },
    { name: "燕麥奶 / Oat Milk" }
  ],
  "果汁 / Juices": [
    { name: "柳橙汁 / Orange Juice" },
    { name: "蘋果汁 / Apple Juice" },
    { name: "檸檬汁 / Lemonade" }
  ],
  "罐裝飲料 / Soda": [
    { name: "可樂 / Coke" },
    { name: "雪碧 / Sprite" },
    { name: "運動飲料 / Sports Beverage" }
  ],
  "厚片吐司 / Thick Toast": [
    { name: "原味吐司 / Original Toast" },
    { name: "奶酥吐司 / Coconut Toast" },
    { name: "花生吐司 / Peanut Toast" },
    { name: "巧克力吐司 / Chocolate Toast" },
    { name: "蒜香吐司 / Garlic Toast" }
  ],
  "熱食 / Hot Meal": [
    { name: "肉包 / Pork Steamed Buns" },
    { name: "奶黃包 / Cream Bun" },
    { name: "燒賣 / Shaomai" },
    { name: "泡麵 / Instant Noodles" }
  ]
};

export default function App() {
  // 必填欄位：場地名稱與連絡電話
  const [venueName, setVenueName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // 訂單列表
  const [orders, setOrders] = useState([]);
  // 當前正在選擇的品項 (若為 null 則不顯示 Modal)
  const [selectedItem, setSelectedItem] = useState(null);
  // 當前品項的冷熱、甜度、數量
  const [quantity, setQuantity] = useState(1);
  const [temp, setTemp] = useState("");
  const [sweetness, setSweetness] = useState("");
  // Google Sheets 回應訊息
  const [orderResponse, setOrderResponse] = useState(null);
  // 載入狀態
  const [loading, setLoading] = useState(false);

  // 點選商品後開啟 Modal
  const openModal = (category, item) => {
    setSelectedItem({ category, name: item.name });
    setQuantity(1);
    setTemp("");
    setSweetness("");
  };

  // 將 Modal 中的設定加入訂單區
  const addToOrders = () => {
    // 僅對「飲料 / Drinks」需檢查冷熱與甜度是否有選擇
    if (selectedItem.category === "飲料 / Drinks" && (!temp || !sweetness)) {
      alert("請選擇冷熱與甜度 / Please select temperature and sweetness");
      return;
    }
    const orderItem = {
      ...selectedItem,
      quantity,
      temp: selectedItem.category === "飲料 / Drinks" ? temp : "",
      sweetness: selectedItem.category === "飲料 / Drinks" ? sweetness : ""
    };
    setOrders([...orders, orderItem]);
    setSelectedItem(null);
  };

  // 刪除訂單項目
  const removeOrder = (index) => {
    if (window.confirm("確定刪除此訂單項目？ / Confirm delete this order item?")) {
      setOrders(orders.filter((_, i) => i !== index));
    }
  };

  // 送出所有訂單到 Google Sheets 並顯示回應
  const submitOrders = async () => {
    if (!venueName.trim() || !contactPhone.trim()) {
      alert("請先填寫場地名稱及連絡電話 / Please fill in Venue Name and Contact Phone");
      return;
    }
    if (orders.length === 0) {
      alert("沒有訂單資料 / No order data");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        venueName,
        contactPhone,
        orders
      };
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbx-BCaKbtWlCGywSOajAaqRtJQU0G8dYfd-nsfly_gv0hOd2F1s4xDvqQqFGXiPBQF5/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.result === "success") {
        setOrderResponse(`訂單已成功送出，訂單編號 / Order ID: ${result.orderId || "未知"}`);
        setOrders([]);
        setVenueName("");
        setContactPhone("");
      } else {
        alert("送出失敗 / Submission failed: " + result.message);
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("送出訂單時發生錯誤 / Error submitting order: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      <h1>訂餐系統 / Ordering System</h1>

      {/* 必填欄位：場地名稱與連絡電話 */}
      <div style={{ marginBottom: "16px", border: "1px solid #ccc", padding: "8px" }}>
        <div style={{ marginBottom: "8px" }}>
          <label>場地名稱 / Venue Name: </label>
          <input
            type="text"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            placeholder="請輸入場地名稱 / Enter Venue Name"
          />
        </div>
        <div>
          <label>連絡電話 (分機/行動) / Contact Phone (Ext/Mobile): </label>
          <input
            type="text"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="請輸入連絡電話 / Enter Contact Phone"
          />
        </div>
      </div>

      {/* 商品選單 */}
      <div>
        {Object.entries(menu).map(([category, items]) => (
          <div key={category} style={{ border: "1px solid #ccc", margin: "8px", padding: "8px" }}>
            <h2>{category}</h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => openModal(category, item)}
                  style={{ padding: "8px" }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal：選擇商品細節（若為「飲料 / Drinks」顯示冷熱、甜度選項；其他類型僅選擇數量） */}
      {selectedItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "8px", width: "90%", maxWidth: "400px" }}>
            <h2>選擇 {selectedItem.name}</h2>
            {selectedItem.category === "飲料 / Drinks" && (
              <>
                <div style={{ marginBottom: "8px" }}>
                  <label>冷/熱： </label>
                  <select value={temp} onChange={(e) => setTemp(e.target.value)}>
                    <option value="">請選擇 / Please Select</option>
                    <option value="冷">冷 / Cold</option>
                    <option value="熱">熱 / Hot</option>
                  </select>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <label>甜度： </label>
                  <select value={sweetness} onChange={(e) => setSweetness(e.target.value)}>
                    <option value="">請選擇 / Please Select</option>
                    <option value="無糖">無糖 / No Sugar</option>
                    <option value="半糖">半糖 / Half Sugar</option>
                    <option value="全糖">全糖 / Full Sugar</option>
                  </select>
                </div>
              </>
            )}
            <div style={{ marginBottom: "8px" }}>
              <label>數量 / Quantity: </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <div style={{ marginTop: "16px" }}>
              <button onClick={() => setSelectedItem(null)} style={{ marginRight: "8px" }}>
                取消 / Cancel
              </button>
              <button onClick={addToOrders}>確定加入訂單 / Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* 訂單區：顯示所有待送出的訂單 */}
      <h2>訂單區 / Order List</h2>
      {orders.length === 0 ? (
        <p>目前沒有訂單 / No orders yet</p>
      ) : (
        <ul>
          {orders.map((order, index) => (
            <li key={index}>
              {order.category} - {order.name}
              {order.category === "飲料 / Drinks" && ` (${order.temp}, ${order.sweetness})`}
              {" "}x {order.quantity}
              <button onClick={() => removeOrder(index)} style={{ marginLeft: "8px" }}>
                刪除 / Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <button onClick={submitOrders} style={{ marginTop: "16px", padding: "8px" }} disabled={loading}>
        {loading ? "送出中 / Submitting..." : "送出所有訂單 / Submit Orders"}
      </button>
      {orderResponse && <p style={{ color: "green" }}>{orderResponse}</p>}
    </div>
  );
}