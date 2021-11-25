import { Router } from "@reach/router";

import Posts from './components/posts'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Posts path="/" />
    </Router>
  );
}

export default App;
