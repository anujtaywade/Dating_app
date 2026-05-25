import { View, TextInput, Button } from "react-native";
import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [phone, setPhone] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://YOUR_IP:2000/auth/login", {
        phone
      });

      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Enter phone"
        value={phone}
        onChangeText={setPhone}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}