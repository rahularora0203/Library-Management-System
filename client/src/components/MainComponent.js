import React, {Component} from 'react';
import Header from './HeaderComponent.js';
import Footer from './FooterComponent.js';
import Home from './HomeComponent.js';
import Booklist from './BooksComponent.js';
import Search from './SearchComponent.js';
import BookDetail from './BookDetailComponent.js';
import {Switch,Route,Redirect, withRouter} from 'react-router-dom';
//import {BOOKS} from '../backup/books';
import {connect} from 'react-redux';
import {Modal,ModalBody,ModalHeader,Button, Label, Col, Row} from 'reactstrap';
import { postBook, fetchBooks, editBook, deleteBook} from '../redux/ActionCreators';
import { Control, LocalForm, Errors  } from 'react-redux-form';

const required = (val) => val && val.length;
const requiredNum = (val) => !!(val);
const maxLength = (len) => (val) => !(val) || (val.length <= len);
const minLength = (len) => (val) => (val) && (val.length >= len);
const maxVal = (len) => (val) => !(val) || (val<= len);
const minVal = (len) => (val) => (val) && (val>= len);
const isNumber = (val) => !isNaN(Number(val));

const mapStateToProps= (state)=>{
  return{
    books: state.books   
  };
}

const mapDispatchToProps = dispatch => ({
  fetchBooks: () => { dispatch(fetchBooks())},
  postBook: (name, author, description, isbn, cat, floor, shelf, copies) => dispatch(postBook(name, author, description, isbn, cat, floor, shelf, copies)),
  editBook: (_id, name, author, description, isbn, cat, floor, shelf, copies) => dispatch(editBook(_id, name, author, description, isbn, cat, floor, shelf, copies)),
  deleteBook: (_id) =>  dispatch(deleteBook(_id))
});

class Main extends Component {
  
  componentDidMount() {
    this.props.fetchBooks();
    }

    constructor(props){
        super(props);
        this.state={
          isAdmin: false,
          isSignedIn: false,
          isDeleteModalOpen: false,
          isEditModalOpen: false,
          selectedBook: null
        };
        this.toggleDeleteModal=this.toggleDeleteModal.bind(this);
        this.toggleEditModal=this.toggleEditModal.bind(this);
        this.changeSelected=this.changeSelected.bind(this);
        this.handleSubmitEdit = this.handleSubmitEdit.bind(this);
      }
    
      handleSubmitEdit(values) {
        this.toggleEditModal();
        this.props.editBook(this.state.selectedBook._id, values.name, values.author,
          values.description, values.isbn, values.cat, values.floor, values.shelf, values.copies);     
        }
    
    changeSelected(_id){
      this.setState({selectedBook:this.props.books.books.filter((book)=>(book._id===_id))[0]});
    }

    toggleDeleteModal(){
      this.setState({isDeleteModalOpen: !this.state.isDeleteModalOpen})
    }
    
    toggleEditModal(){
      this.setState({isEditModalOpen: !this.state.isEditModalOpen});
    }

    render(){
      const BookWithId = ({match}) => {
      let selectedBook=this.props.books.books.filter((book) => (book._id)===(match.params.bookId))[0]
      let notFoundErr=null;
      if(selectedBook===undefined){
      notFoundErr=("\n\n Error 404 :  Book not found");
      }  
      return(
          <BookDetail book={selectedBook}
          isLoading={this.props.books.isLoading}
          errMess={this.props.books.errMess||notFoundErr}
          toggleEditModal={this.toggleEditModal}
          changeSelected={this.changeSelected}
          />
          );
      };
            
    
    return ( 
          <div className="App">
          <Header isSignedIn={this.state.isSignedIn}/>
          <Switch location={this.props.location}>
                      <Route exact path='/home' component={() => <Home />} />
                      <Route exact path='/search' component={() => <Search 
                      books={this.props.books.books}
                      booksLoading={this.props.books.isLoading}
                      booksErrMess={this.props.books.errMess}
                      isSignedIn={this.state.isSignedIn}
                      toggleEditModal={this.toggleEditModal}
                      toggleDeleteModal={this.toggleDeleteModal}
                      changeSelected={this.changeSelected}
                      isAdmin={this.state.isAdmin}/>}/>

                      <Route exact path='/books' component={() => <Booklist
                      books={this.props.books.books}
                      booksLoading={this.props.books.isLoading}
                      booksErrMess={this.props.books.errMess}
                      isSignedIn={this.state.isSignedIn}
                      toggleEditModal={this.toggleEditModal}
                      toggleDeleteModal={this.toggleDeleteModal}
                      changeSelected={this.changeSelected}
                      isAdmin={this.state.isAdmin}/>}/>
                      <Route path='/books/:bookId' component={BookWithId} />
                      <Redirect to="/home"/>
          </Switch>
        <Footer/>
        <Modal isOpen={this.state.isDeleteModalOpen} toggle={this.toggleDeleteModal}>
                     <ModalHeader toggle={this.toggleDeleteModal}>
                         Confirm Deletion
                     </ModalHeader>
                     <ModalBody>
                       Book details : <br/><br/>
                        Name : {this.state.selectedBook?this.state.selectedBook.name:''} <br/>
                        Authors : {this.state.selectedBook?this.state.selectedBook.author:''} <br/>
                        ISBN Number : {this.state.selectedBook?this.state.selectedBook.isbn:''} <br/>
                        Available Copies : {this.state.selectedBook?this.state.selectedBook.copies:''} <br/> <br/>
                        Are you sure you wish to delete this book ? <br/><br/>
         <Button color="danger" onClick={()=>{
           this.props.deleteBook(this.state.selectedBook._id);
           this.toggleDeleteModal();}}>Yes</Button>{' '}  
         <Button color="warning" onClick={()=>{
           this.toggleDeleteModal();
         }}>No</Button>
                     </ModalBody>
          </Modal>
          {this.state.selectedBook?(
                 <Modal isOpen={this.state.isEditModalOpen} toggle={this.toggleEditModal}>
                     <ModalHeader toggle={this.toggleEditModal}>
                         Edit a book
                     </ModalHeader>
                     <ModalBody>
                    <LocalForm onSubmit={(values) => this.handleSubmitEdit(values)}>
                    <Row className="form-group">
                                <Label htmlFor="name" md={2}>Name </Label>
                                <Col md={10}>
                                    <Control.text model=".name" id="name" name="name"
                                        defaultValue={this.state.selectedBook.name}
                                        className="form-control"
                                        validators={{
                                            required, minLength: minLength(3)
                                        }}
                                         />
                                    <Errors
                                        className="text-danger"
                                        model=".name"
                                        show="touched"
                                        messages={{
                                            required: 'Required',
                                            minLength: 'Must be greater than 2 characters'
                                        }}
                                     />
                                </Col>
                            </Row>                    
                            <Row className="form-group">
                                <Label htmlFor="author" md={2}>Authors </Label>
                                <Col md={10}>
                                    <Control.text model=".author" id="author" name="author"
                                        defaultValue={this.state.selectedBook.author}
                                        className="form-control"
                                        validators={{
                                            required, minLength: minLength(3)
                                        }}
                                         />
                                    <Errors
                                        className="text-danger"
                                        model=".author"
                                        show="touched"
                                        messages={{
                                            required: 'Required',
                                            minLength: 'Must be greater than 2 characters'
                                        }}
                                     />
                                </Col>
                            </Row>
                            <Row className="form-group">
                                <Label htmlFor="isbn" md={4}>ISBN No.</Label>
                                <Col md={8}>
                                    <Control.text model=".isbn" id="isbn" name="isbn"
                                        defaultValue={this.state.selectedBook.isbn}
                                        className="form-control"
                                        validators={{
                                            required, minLength: minLength(10), maxLength: maxLength(13), isNumber
                                        }}
                                         />
                                    <Errors
                                        className="text-danger"
                                        model=".isbn"
                                        show="touched"
                                        messages={{
                                            required: 'Required',
                                            minLength: 'Must be greater than 9 numbers',
                                            maxLength: 'Must be 13 numbers or less',
                                            isNumber: 'Must be a number'
                                        }}
                                     />
                                </Col>
                            </Row>
                                        
                        <Row className="form-group">
                            <Col>
                            <Label htmlFor="cat">Category</Label>
                            <Control.select model=".cat" id="cat" className="form-control" defaultValue={this.state.selectedBook.cat}>
                              <option>Romance</option> <option>Technology</option>
                              <option>Computer Science</option> <option>Management</option>
                              <option>Electronics</option> <option>Physics</option>
                              <option>Chemistry</option> <option>Mathematics</option>
                              <option>Fiction</option> <option>Philosophy</option>
                              <option>Language</option> <option>Arts</option>
                              <option>Other</option> 

                                                          </Control.select>
                            </Col>
                        </Row>

                        <Row className="form-group">
                                <Label htmlFor="copies" md={6}> Copies Available</Label>
                                <Col md={6}>
                                    <Control.text model=".copies" id="copies" name="copies"
                                        defaultValue={this.state.selectedBook.copies}
                                        className="form-control"
                                        validators={{
                                            requiredNum, minVal: minVal(1), maxVal: maxVal(1000), isNumber
                                        }}
                                         />
                                    <Errors
                                        className="text-danger"
                                        model=".copies"
                                        messages={{
                                            requiredNum: 'Required',
                                            minVal: 'Must be greater than 0',
                                            maxVal: 'Must be 1000 or less',
                                            isNumber: 'Must be a number'
                                        }}
                                     />
                                </Col>
                            </Row>

                        <Row className="form-group">
                            <Col>
                            <Label htmlFor="floor">Floor </Label>
                            <Control.select model=".floor" id="floor" className="form-control" defaultValue={this.state.selectedBook.floor}>
                              <option>0</option> <option>1</option>
                              <option>2</option> <option>3</option>
                              <option>4</option> <option>5</option>
                              <option>6</option> <option>7</option>
                              <option>8</option> 
                            </Control.select>
                            </Col>
                        </Row>
                        
                        <Row className="form-group">
                                <Label htmlFor="shelf" md={6}> Shelf</Label>
                                <Col md={6}>
                                    <Control.text model=".shelf" id="shelf" name="shelf"
                                        defaultValue={this.state.selectedBook.shelf}
                                        className="form-control"
                                        validators={{
                                            requiredNum, minVal: minVal(1), maxVal: maxVal(100), isNumber
                                        }}
                                         />
                                    <Errors
                                        className="text-danger"
                                        model=".shelf"
                                        messages={{
                                            requiredNum: 'Required',
                                            minVal: 'Must be greater than 0',
                                            maxVal: 'Must be 100 or less',
                                            isNumber: 'Must be a number'
                                        }}
                                     />
                                </Col>
                            </Row>

                     
                        <Row className="form-group">
                                <Label htmlFor="description" md={2}>Description</Label>
                                <Col md={10}>
                                    <Control.textarea model=".description" id="description" name="description"
                                        rows="12"
                                        defaultValue={this.state.selectedBook.description}
                                        className="form-control" />
                                </Col>
                            </Row>
                          <Row>
                          <Col className="ml-auto mr-auto">
                        <Button type="submit" className="bg-primary">
                            Submit
                        </Button>
                        </Col>
                        </Row>
                    </LocalForm>
                </ModalBody>
               
          </Modal>):(<React.Fragment/>)}

          </div>
           );     
    }
    }

    export default withRouter(connect(mapStateToProps,mapDispatchToProps)(Main));

