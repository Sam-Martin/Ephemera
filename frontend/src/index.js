import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from "react-router-dom";
import _ from 'lodash'
import fetch from 'node-fetch'
import CopyToClipboard from 'react-copy-to-clipboard'
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
        <SecretEntry apiUrl='https://pjelxem04b.execute-api.eu-west-2.amazonaws.com/prod/'/>
      )
    }
    return (
        <SecretDisplay apiUrl='https://pjelxem04b.execute-api.eu-west-2.amazonaws.com/prod/'/>
    )
  }
}

function SecretDisplay(props){
  return (
    <Container>
      <Form>
        <Form.Group controlId="formBasicEmail">
          <Form.Label><h1>Secret</h1></Form.Label>
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
    return fetch(this.props.apiUrl+action, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dict)
    })
    .then((response) => response.json())
    .then((responseData) => {
      this.setState(state => ({
        loading: false,
        error: false
      }))
      return responseData
    }).
    catch((error) => {
      if (error === 'TypeError: Failed to fetch'){
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
      this.setState(state => ({
        secretId: response.key
      }))
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
        {!this.state.secretId &&
          <SecretEntryForm loading={this.state.loading} saveSecretHandler={this.saveSecret} />
        }
        {this.state.secretId &&
          <SecretUrlDisplay secretId={this.state.secretId}/>
        }
      </Container>
    )
  }
}

class SecretUrlDisplay extends React.Component {
  secretUrl(){
    return window.location.origin + '/?secretId=' + this.props.secretId
  }
  render() {
    return(
      <div>
        <Form.Group>
            <Form.Label><h1>Secret URL</h1></Form.Label>
          <Form.Control type="text" defaultValue={this.secretUrl()} name="secretUrl" />
        </Form.Group>
        <Form.Group>
          <CopyToClipboard text={this.secretUrl()}>
            <Button>Copy URL</Button>
          </CopyToClipboard>
          <Button variant="success" className="ml-1">Add New Secret</Button>
        </Form.Group>
      </div>
    )
  }
}

function SecretEntryForm(props){
  return (
    <Form onSubmit={props.saveSecretHandler}>
      <h1>Enter Secret</h1>
      <Form.Group controlId="formSecretText">
        <Form.Control as="textarea" placeholder="Enter secret here" name="secretText" disabled={props.loading}/>
      </Form.Group>
      <Button type="submit" disabled={props.loading}>
        {props.loading &&
          <Spinner
            as="span"
            animation="grow"
            size="sm"
            role="status"
            aria-hidden="true"
          />
        }
        {props.loading ? ' Getting URL...' : 'Get URL'}
      </Button>
    </Form>
  )
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
