import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Dimensions, View } from "react-native";
import Swiper from "react-native-swiper/src";

const { width } = Dimensions.get("window");

const Banner = () => {
  const [bannerData, setBannerData] = useState([]);

  useEffect(() => {
    setBannerData([
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo5kieHiWmEbXLD2EjuY_l8R7010o47-3JCAZ4Hc_-sW2P5sbh9IT1sS2T82xMHAPgusI&usqp=CAU",
      "https://www.yardproduct.com/blog/wp-content/uploads/2016/01/gardening-banner.jpg",
      "https://t3.ftcdn.net/jpg/06/58/31/10/360_F_658311073_jv0oobaa7DOjWlya5LeEx2Wq64iRLyhB.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo5kieHiWmEbXLD2EjuY_l8R7010o47-3JCAZ4Hc_-sW2P5sbh9IT1sS2T82xMHAPgusI&usqp=CAU",
      "https://www.yardproduct.com/blog/wp-content/uploads/2016/01/gardening-banner.jpg",
      "https://t3.ftcdn.net/jpg/06/58/31/10/360_F_658311073_jv0oobaa7DOjWlya5LeEx2Wq64iRLyhB.jpg",
    ]);
    return () => setBannerData([]);
  }, []);

  return (
    <View style={styles.container}>
      <Swiper
        autoplay
        autoplayTimeout={3}
        loop
        showsButtons={false}
        showsPagination
        paginationStyle={{ bottom: 10 }}
        activeDotStyle={{ backgroundColor: "#4CAF50" }}
        removeClippedSubviews={false} // Ensures proper swipe handling
      >
        {bannerData.map((item, index) => (
          <Image
            key={index}
            source={{ uri: item }}
            style={styles.imageBanner}
            resizeMode="cover"
          />
        ))}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: width / 2,
  },
  imageBanner: {
    width: "100%",
    height: "100%",
  },
});

export default Banner;
