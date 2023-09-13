import "./App.css";
import { useRef, useState } from "react";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
// import 'firebase/analytics';

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyBTHMQ0SRm56IVP4tH9I75v4vvMlf1t9pw",
  authDomain: "superchat-a3025.firebaseapp.com",
  projectId: "superchat-a3025",
  storageBucket: "superchat-a3025.appspot.com",
  messagingSenderId: "810538401395",
  appId: "1:810538401395:web:e7c12897e38729e5ffb406",
  measurementId: "G-QFT197TBQV",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
//

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>SuperChat💬</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' }); // This line ensures Google asks for profile info, including display name
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    <div className="text" >
    <p >
       Where Minds Unite and ideas Ignite
      </p>
    </div>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}
function ChatRoom() {
  const dummy = useRef();
  const messageRef = firestore.collection("messages");
  const query = messageRef.orderBy("createdAt").limit(25);
  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    const user = auth.currentUser; // Get the current user
      // Check if the user has a display name; if not, use their email as a fallback
  const displayName = user.displayName || user.email;
    const { uid, photoURL } = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      username:displayName
    });
    setFormValue("");

    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
      <SignOut />
    </div>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL, username } = props.message; // Include 'username' in the destructuring

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <div className="user-info">
        <img
          className="user-avatar"
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
          alt="User Avatar"
        />
        <p className="username">{username}</p>
      </div>
      <div className="message-content">
        <p className="text">{text}</p>
      </div>
    </div>
  );
}


export default App;