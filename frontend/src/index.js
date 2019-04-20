import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from "react-router-dom";
import _ from 'lodash'
import './ephemera.css';
import githubLogo from './GitHub-Mark-Light-120px-plus.png';
import logo from './ephemera-log-no-background.png';

import {Container, Jumbotron, Navbar, Nav} from 'react-bootstrap';

import Error from './components/lib/Error'
import Loading from './components/lib/Loading'
import SecretDisplay from './components/SecretDisplay'
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
    if(this.props.isLoadingConfig){
      return(
        <Loading/>
      )
    }
    if(_.isEmpty(this.props.secretId)){
      return (
        <SecretEntry apiUrl={this.props.apiUrl} isLoadingApiUrl={this.props.isLoadingApiUrl} />
      )
    }
    if(this.props.error){
      return(
        <Error message={this.props.error}/>
      )
    }
    return (
        <SecretDisplay
          apiUrl={this.props.apiUrl}
          isLoadingApiUrl={this.props.isLoadingApiUrl}
          secretId={this.props.secretId}
          newSecretHandler={this.props.newSecretHandler}
        />
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
  constructor(props) {
    super(props);
    this.newSecret = this.newSecret.bind(this)
    this.state = {
      isLoadingConfig: true,
      apiUrl: null,
      secretId: this.searchParams.getAll('secretId'),
      error: null,
      redirectToHome: false
    };
  }
  componentDidMount() {
    fetch('http://ephemera.sammart.in.s3-website.eu-west-2.amazonaws.com/js/config.json')
      .then(response => response.json())
      .then(data => this.setState({ apiUrl: data['apiUrl'], isLoadingConfig: false }))
      .catch(error => this.setState({ error: this.makeFriendlyError(error), isLoadingConfig: false }));;
  }

  makeFriendlyError(error){
    switch(error.toString()){
      case 'TypeError: Failed to fetch':
        return 'Failed to load config'
      default:
        return error
    }
  }
  newSecret(){
    this.setState({
      secretId: null
    })
  }
  searchParams = new URLSearchParams(this.props.location.search);
  render() {
    return (
        <div>
          <Header />
          <SubHeader />
          <Content
            apiUrl={this.state.apiUrl}
            isLoadingConfig={this.state.isLoadingConfig}
            secretId={this.state.secretId}
            error={this.state.error}
            newSecretHandler={this.newSecret}
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
