import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from "react-router-dom";
import _ from 'lodash'
import fetch from 'node-fetch'

import './ephemera.css';
import githubLogo from './GitHub-Mark-Light-120px-plus.png';
import logo from './ephemera-log-no-background.png';

import {Container, Form, Jumbotron, Navbar, Nav, Button, Spinner, Alert} from 'react-bootstrap';

class Header extends React.Component {
  render () {
     return (
      <div>
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand href="">
              <Nav.Item><h3><img src={logo} className="logo_small"/> Ephemera - One Time Password Transfer</h3></Nav.Item>
            </Navbar.Brand>
             <Navbar.Brand className="justify-content-end" >
                <Nav.Link href="https://github.com/Sam-Martin/Ephemera/"><h3><img src={githubLogo}/></h3></Nav.Link>
             </Navbar.Brand>
          </Container>
        </Navbar>
      </div>
      )
  }
}

class Content extends React.Component {
  render(){
    if(_.isEmpty(this.props.secretId)){
      return (
        <SecretEntry/>
      )
    }
    return (
        <SecretDisplay />
    )
  }
}

function SecretDisplay(props){
  return (
    <Container>
      <Form>
        <Form.Group controlId="formBasicEmail">
          <Form.Label><h1>Secret:</h1></Form.Label>
        </Form.Group>
        <Form.Control as="textarea" placeholder="Loading..." className="secretOutput" />
      </Form>
    </Container>
  )

}

class SecretEntry extends React.Component {
  constructor(props){
    super(props)
    this.saveSecret = this.saveSecret.bind(this)
    this.state = {
      loading: false
    }
  }
  apiPost(action, dict){
    this.setState(state => ({
      loading: true,
      error: false
    }));
    return fetch('https://pjelxem04b.execute-api.eu-west-2.amazonaws.com/prod/'+action, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dict)
    })
    .then((response) => response.json())
    .then((responseData) => {
      return responseData
    }).
    catch((error) => {
      if (error == 'TypeError: Failed to fetch'){
        error = 'Error submitting data'
      }
      this.setState(state => ({
        loading: false,
        error: true,
        errorMessage: error
      }))
    })

  }
  saveSecret(e){
    e.preventDefault()
    this.apiPost('addTextSecret', {secretText:e.target.secretText.value})
    .then((response) => {
      console.log(response)
    })
  }

  render() {
    return (
      <Container>
        {this.state.error &&
          <Alert variant="danger">
            {this.state.errorMessage.toString()}
          </Alert>
        }
        <Form onSubmit={this.saveSecret}>
          <Form.Group controlId="formBasicEmail">
            <Form.Control as="textarea" placeholder="Enter Secret" name="secretText" disabled={this.state.loading}/>
          </Form.Group>
          <Button type="submit" disabled={this.state.loading}>
            {this.state.loading &&
              <Spinner
                as="span"
                animation="grow"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            }
            {this.state.loading ? ' Getting URL...' : 'Get URL'}
          </Button>
        </Form>
      </Container>
    )
  }
}

function SubHeader() {
  return (
    <Jumbotron>
      <Container className="text-center">
        <h1>Ephemera</h1>
        <h2>Secret Transfer</h2>
        <p>Enter a text secret and you will be provided with a one-time use URL to give to the intended secret recipient.</p>
     </Container>
    </Jumbotron>
  )
}


class Home extends React.Component {
  searchParams = new URLSearchParams(this.props.location.search);
  render() {
    return (
        <div>
          <Header />
          <SubHeader />

          <Content
            secretId={this.searchParams.getAll('secretId')}
            saveSecretHandler={this.saveSecret}
          />
        </div>
    )
  }
}



// ========================================

ReactDOM.render(
  <Router>
    <Route component={Home} />
  </Router>,
  document.getElementById('root')
);
