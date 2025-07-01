import React from 'react'
import Background from '../../components/auth/Background'
import Logo from '../../components/auth/Logo'
import Header from '../../components/auth/Header'
import Button from '../../components/auth/Button'
import Paragraph from '../../components/auth/Paragraph'

export default function StartScreen({ navigation }) {
  return (
    <Background>
      <Logo />
      <Header>PRECIAGRI</Header>
      <Paragraph>
        Connect, trade, and grow—Log in or sign up now!
      </Paragraph>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('LoginScreen')}
      >
        Login
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('SignUpScreen')}
      >
        Sign Up
      </Button>
    </Background>
  )
}
