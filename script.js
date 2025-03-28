document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyA1234567890abcdefghijklmnopqrstuv",
      authDomain: "epic-adventure-game.firebaseapp.com",
      projectId: "epic-adventure-game",
      storageBucket: "epic-adventure-game.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:a1b2c3d4e5f6a7b8c9d0e1"
    };
  
    // Initialize Firebase - check if Firebase is already initialized
    if (!window.firebase || !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    // Firebase storage reference for game extensions
    const storage = firebase.storage();
    const extensionsRef = storage.ref('game-extensions');
    
    // Function to track downloads
    const trackDownload = (extensionName) => {
      // Get database reference
      const db = firebase.firestore();
      const downloadsCollection = db.collection('downloads');
      
      // Add download record
      downloadsCollection.add({
        extensionName: extensionName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userAgent: navigator.userAgent
      })
      .then(() => {
        console.log('Download tracked successfully');
      })
      .catch((error) => {
        console.error('Error tracking download:', error);
      });
    };
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 80, // Offset for the sticky header
            behavior: 'smooth'
          });
        }
      });
    });
    
    // Download button functionality
    const downloadButton = document.getElementById('download-button');
    if (downloadButton) {
      downloadButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Track main game download
        trackDownload('main-game');
        
        // Show download starting message
        alert('Your download is starting. Thank you for downloading Epic Adventure Game!');
        
        // In a real application, this would trigger an actual download
        // For demo purposes, we're just showing an alert
        
        // You could implement actual download functionality like this:
        const link = document.createElement('a');
        link.href = 'path/to/game.exe';
        link.download = 'EpicAdventureGame_Setup.exe';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
    
    // Add active class to current nav item based on URL
    const currentLocation = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar nav ul li a');
    
    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      
      // Check if the current path matches the link
      if (currentLocation.endsWith(linkPath)) {
        link.classList.add('active');
      }
    });
    
    // Function to load available game extensions
    const loadGameExtensions = () => {
      const extensionsContainer = document.getElementById('game-extensions-container');
      if (!extensionsContainer) return;
      
      // Reference to Firestore collection for extensions
      const db = firebase.firestore();
      const extensionsCollection = db.collection('game-extensions');
      
      // Clear existing content
      extensionsContainer.innerHTML = '<h3>Loading extensions...</h3>';
      
      // Get extensions from Firestore
      extensionsCollection.get()
        .then((querySnapshot) => {
          if (querySnapshot.empty) {
            extensionsContainer.innerHTML = '<h3>No extensions available at this time</h3>';
            return;
          }
          
          extensionsContainer.innerHTML = '';
          querySnapshot.forEach((doc) => {
            const extension = doc.data();
            
            // Create extension card
            const extensionCard = document.createElement('div');
            extensionCard.className = 'extension-card';
            extensionCard.innerHTML = `
              <h4>${extension.name}</h4>
              <p>${extension.description}</p>
              <p><strong>Size:</strong> ${extension.size}</p>
              <p><strong>Version:</strong> ${extension.version}</p>
              <button class="extension-download-btn" data-id="${doc.id}">Download Extension</button>
            `;
            
            extensionsContainer.appendChild(extensionCard);
          });
          
          // Add event listeners to extension download buttons
          document.querySelectorAll('.extension-download-btn').forEach(button => {
            button.addEventListener('click', function() {
              const extensionId = this.getAttribute('data-id');
              downloadExtension(extensionId);
            });
          });
        })
        .catch((error) => {
          console.error("Error getting extensions: ", error);
          extensionsContainer.innerHTML = '<h3>Error loading extensions. Please try again later.</h3>';
        });
    };
    
    // Function to download a specific extension
    const downloadExtension = (extensionId) => {
      const db = firebase.firestore();
      
      // Get extension details
      db.collection('game-extensions').doc(extensionId).get()
        .then((doc) => {
          if (doc.exists) {
            const extensionData = doc.data();
            
            // Track the extension download
            trackDownload(extensionData.name);
            
            // Show download message
            alert(`Downloading ${extensionData.name}...`);
            
            // In a real app, you would initiate the download from Firebase Storage here
            // For example:
            // storage.ref(`extensions/${extensionData.filename}`).getDownloadURL()
            //   .then((url) => {
            const link = document.createElement('a');
            link.href = url;
            link.download = extensionData.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            //   });
          } else {
            alert("Extension not found!");
          }
        })
        .catch((error) => {
          console.error("Error downloading extension: ", error);
          alert("Failed to download extension. Please try again.");
        });
    };
    
    // If on the download page, load extensions
    if (window.location.pathname.includes('download')) {
      loadGameExtensions();
    }
  });
  