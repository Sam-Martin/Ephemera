import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from "react-router-dom";
import _ from 'lodash'
import './ephemera.css';
import githubLogo from './GitHub-Mark-Light-120px-plus.png';
import logo from './ephemera-log-no-background.png';

import {Container, Form, Jumbotron, Navbar, Nav} from 'react-bootstrap';

import SecretEntry from './components/SecretEntry'

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
