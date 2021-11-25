import React, { useEffect, useState } from "react";
import { Link } from "@reach/router";
import Container from 'react-bootstrap/Container';
import {Row, Col, Form, Button, Nav, Navbar, Card, Tab, Tabs, Modal, Table} from 'react-bootstrap';



const initialFormData = Object.freeze({
  title: "",
  username: "",
  text: "",
  link: "",
  type: "",
  image: "",
  comments: []
});

const initialCommentFormData = Object.freeze({
  comment: "",
  username: "",
  currentPostId: 0
});

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [formData, updateFormData] = React.useState(initialFormData);
  const [commentFormData, updateCommentFormData] = React.useState(initialCommentFormData);
  const [show, setShow] = useState(false);

  const handleChange = (e) => {
    updateFormData({
      ...formData,
      [e.target.name]: e.target.value.trim()
    });
  };

  const handleCommentChange = (e) => {
    updateCommentFormData({
      ...commentFormData,
      [e.target.name]: e.target.value.trim()
    });
  };

  const checkBrowser = () => {
    return navigator.appCodeName;
  }

  const getCurrentTime = () => {
    var myDate = new Date()
    return myDate.toLocaleString("en-US", {timeZone: "America/Los_Angeles"})
  }

  const submitPostText = async (event) => {
    event.preventDefault();

    if (formData[formData.type] === "") {
      alert("Please fill in the post content.");
      return;
    }

    // Get additional info
    formData['submitTime'] = getCurrentTime();
    formData['browser'] = checkBrowser();
    formData['content'] = formData[formData.type];

    const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json'},
          body: JSON.stringify(formData)
        };
    await fetch('http://localhost:8787/posts', requestOptions).then(function(response) {
      console.log(response.text())
    });
    alert("You post has been submitted!");
    window.location.reload(false);
  };

  const submitComment = async (event) => {
    event.preventDefault();

    if (commentFormData['username'] === "" || commentFormData['comment'] === "") {
      alert("Please fill in the comment.");
      return;
    }

    commentFormData['submitTime'] = getCurrentTime();

    const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json'},
          body: JSON.stringify(commentFormData)
        };
    const resp = await fetch('http://localhost:8787/comments', requestOptions);
    alert("You comment has been submitted!");
    window.location.reload(false);
  };

  

  const changeType = (e) => {
    updateFormData({
      ...formData,
      type: e.target.name
    });
  }

  useEffect(() => {
    const getPosts = async () => {
      const resp = await fetch(
        "http://localhost:8787/posts"
      );
      const postsResp = await resp.json();
      setPosts(postsResp);
    };

    getPosts();
  }, []);



  const handleClose = () => setShow(false);
  const handleShow = (e) => {
    updateCommentFormData({
      ...commentFormData,
      currentPostId: e.target.getAttribute("postid")
    });
    setShow(true);
  }

  const displaySingleComment = (comment, i) => {
      return ( 
        <tr key={i}>
          <td>{comment.comment}</td>
          <td>{comment.username}</td>
          <td>{comment.submitTime}</td>
        </tr>
      )
  }

  const commentTable = (comments) => {
    if (comments.length === 0) {
      return <></>;
    } else {
      return (
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>Content</th>
              <th>Author</th>
              <th>Posted</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment, i) => (
              displaySingleComment(comment, i)
            ))}
          </tbody>
        </Table>
      )
    }
  }

  const displayComments = (posts) => {
    var currentPost = posts.filter(obj => {
      return obj.id == commentFormData['currentPostId']
    })
    var currentComments
    if (currentPost.length < 1) {
      currentComments = []
    } else {
      currentComments = currentPost[0].comments
    }
    return (
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Comments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {commentTable(currentComments)}
          {currentComments.length} comments in total
        </Modal.Body>
        <Modal.Header>
          <Modal.Title>Submit a new comment!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>        
            <Form.Group className="mb-3" controlId="">
              <Form.Label>New Comment</Form.Label>
              <Form.Control type="text" name="comment" onChange={handleCommentChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="">
              <Form.Label>Your Name</Form.Label>
              <Form.Control type="text" name="username" onChange={handleCommentChange} />
            </Form.Group>            
          </Form> 
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={submitComment}>
            Post Comment
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  const displaySinglePost = (post, i) => {
    if (post.type === "text") {
      return ( 
        <Card border="secondary" key={i}>
          <Card.Header>
            From {post.username}, Posted at {post.submitTime} PT with {post.browser}.
            <Button variant="outline-secondary" postid={post.id} onClick={handleShow} style={{float: "right"}} size="sm">
              {post.comments.length} comment{post.comments.length > 1 ? "s":""}
            </Button>
          </Card.Header>
          <Card.Body>
            <Card.Title>{post.title}</Card.Title>
            <Card.Text>
              {post.content}
            </Card.Text>
          </Card.Body>
        </Card> 
      )
    } else if (post.type === "link") {
      return ( 
        <Card border="info" key={i}>
          <Card.Header>
            From {post.username}, Posted at {post.submitTime} PT with {post.browser}.
            <Button variant="outline-secondary" postid={post.id} onClick={handleShow} style={{float: "right"}} size="sm">
              {post.comments.length} comment{post.comments.length > 1 ? "s":""}
            </Button>
          </Card.Header>
          <Card.Body>
            <Card.Title>
              <a href={post.content}>{post.title}</a>
            </Card.Title>
          </Card.Body>
        </Card> 
      )
    } else if (post.type === "image") {
      return ( 
        <Card border="primary" key={i}>
          <Card.Header>
            From {post.username}, Posted at {post.submitTime} PT with {post.browser}.
            <Button variant="outline-secondary" postid={post.id} onClick={handleShow} style={{float: "right"}} size="sm">
              {post.comments.length} comment{post.comments.length > 1 ? "s":""}
            </Button>
          </Card.Header>
          <Card.Body>
            <Card.Title>{post.title}</Card.Title>
            <Card.Text>
              < img style={{width: '50%'}} src={post.content}></img>
            </Card.Text>
          </Card.Body>
        </Card> 
      )
    }
  }

  return (
    <Container>
      <Navbar bg="dark" variant="dark">
        <Container>
        <Navbar.Brand href="#home">Posts</Navbar.Brand>
          <Nav className="me-auto">
        </Nav>
        </Container>
      </Navbar>
      <Row>
        <Col xs={12} md={8}>
        <br/>
          {posts.map((post, i) => (
            displaySinglePost(post, i)
          ))}
        </Col>
        {displayComments(posts)}

        <Col xs={6} md={4}>
        <br/>
              <Form onSubmit={submitPostText}>
                <Form.Group className="mb-3" controlId="" >
                  <Form.Label>Post Title</Form.Label>
                  <Form.Control type="text" name="title" placeholder="Your Title" onChange={handleChange} required/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" name="username" placeholder="Your Name" onChange={handleChange} required/>
                </Form.Group>
                <Tabs defaultActiveKey="text" id="uncontrolled-tab-example" className="mb-3">
                  <Tab eventKey="text" title="Text">
                    <Form.Group className="mb-3" controlId="">
                      <Form.Label>Post Content</Form.Label>
                      <Form.Control as="textarea" name="text" rows={3} onChange={handleChange}/>
                    </Form.Group>
                    <Button variant="primary" type="submit" name="text" onClick={changeType} >
                      Submit
                    </Button>
                  </Tab>
                  <Tab eventKey="link" title="Link">
                    <Form.Group className="mb-3" controlId="">
                      <Form.Label>Post Link</Form.Label>
                      <Form.Control type="text" name="link" onChange={handleChange} />
                    </Form.Group>
                    <Button variant="primary" type="submit" name="link" onClick={changeType} >
                      Submit
                    </Button>
                  </Tab>
                  <Tab eventKey="image" title="Image">
                    <Form.Group className="mb-3">
                      <Form.Label>Image Link</Form.Label>
                      <Form.Control type="text" name="image" onChange={handleChange} />
                    </Form.Group>
                    <Button variant="primary" type="submit" name="image" onClick={changeType} >
                      Submit
                    </Button>
                  </Tab>
                </Tabs>     
              </Form>      
        </Col>
      </Row>

    </Container>
  );
};

export default Posts;