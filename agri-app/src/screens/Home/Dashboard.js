import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Banner from "../../components/home/Banner"
import { ScrollView } from 'react-native-gesture-handler';
import { Container, Header, Icon, Item, Input, Text } from 'native-base';
const HomeScreen = ({ navigation }) => {
  const handleLogout = async () => {
    // Clear the token from AsyncStorage
    await AsyncStorage.removeItem('userToken');
    navigation.replace('LoginScreen'); // Navigate back to the Login screen
  };
  const [focus, setFocus] = useState();
  const openList = () => {
    setFocus(true);
  };

  const onBlur = () => {
    setFocus(false);
  };
  return (
    <Container>
      <Header searchBar rounded style={{ backgroundColor: "gainsboro" }}>
        <Item>
          <Icon name="ios-search" />
          <Input
            placeholder="Search"
            onFocus={openList}
          // onChangeText={(text) => searchProduct(text)}
          />
          {focus == true ? <Icon onPress={onBlur} name="ios-close" /> : null}
        </Item>
      </Header>
      <ScrollView>
        <View>
          <Banner />
          <Button title="Logout" onPress={handleLogout} />
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
