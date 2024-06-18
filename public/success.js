function loadPublicPosts() {
    fetch('/api/posts/all')
        .then(response => response.json())
        .then(data => {
            console.log(data)
            for(post in data){
                console.log(data[post])
                ShowPost(data[post],'public')
            }
            
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function move_to_public_posts() {
    document.getElementById("select-screen").style.display = "none";
    document.getElementById("public-posts-div").style.display = "block";
    loadPublicPosts(); // Load public posts when navigating to the public posts view
}

function move_to_own_posts() {
    document.getElementById("my-posts-div").style.display = "block";
    document.getElementById("select-screen").style.display = "none";   
}

function Back(div) {
    if (div == "my-posts-div") {
        document.getElementById("my-posts-div").style.display = "none";
        document.getElementById("select-screen").style.display = "block";
    } else if (div == "public-posts-div") {
        document.getElementById("public-posts-div").style.display = "none";
        document.getElementById("select-screen").style.display = "block";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('postForm');
    const usernameSpan = document.getElementById('username');
    let UserName = '';

    // Fetch username
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            if (!data.username) {
                return;
            }
            UserName = data.username;
            usernameSpan.textContent = data.username;
            loadUserPosts();
        })
        .catch(error => {
            console.error('Error:', error);
        });

    if (postForm) {
        postForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const postTitle = document.getElementById('postTitle').value;
            const postCategory = document.getElementById('postCategory').value;
            const postPrice = document.getElementById('postPrice').value;
            const postContact = document.getElementById('postContact').value;
            const postImages = document.getElementById('postImages').files;
            if (postTitle && postCategory && postPrice && postContact && postImages.length > 0) {
                // Read and convert images to base64
                const promises = Array.from(postImages).map(image => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = error => reject(error);
                        reader.readAsDataURL(image); // Convert to base64
                    });
                });

                Promise.all(promises)
                    .then(base64Images => {
                        const postData = {
                            owner: UserName,
                            title: postTitle,
                            category: postCategory,
                            price: postPrice,
                            contact: postContact,
                            images: base64Images // Corrected property name
                        };

                        fetch('/api/posts', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(postData),
                        })
                        .then(response => {
                            if (response.ok) {
                                hidePreview(); // Hide preview section
                                loadUserPosts(); // Reload user posts
                            } 
                        });
                    });
            }
        });
    }

    function loadUserPosts() {
        fetch('/api/posts')
            .then(response => response.json())
            .then(posts => {
                const yourPostsDiv = document.getElementById('your-posts');
                yourPostsDiv.innerHTML = '';
                posts.forEach(post => {
                    ShowPost(post, 'show');
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }


});

function ShowPostbtn(mode = 'preview') {
    const postTitle = document.getElementById('postTitle').value;
    const postCategory = document.getElementById('postCategory').value;
    const postPrice = document.getElementById('postPrice').value;
    const postContact = document.getElementById('postContact').value;
    const postImages = document.getElementById('postImages').files;

    if (postTitle && postCategory && postPrice && postContact && postImages.length > 0) {
        // Read and convert images to base64
        const promises = Array.from(postImages).map(image => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(image); // Convert to base64
            });
        });

        Promise.all(promises)
            .then(base64Images => {
                const postData = {
                    title: postTitle,
                    category: postCategory,
                    price: postPrice,
                    contact: postContact,
                    images: base64Images
                };
                ShowPost(postData, mode); // Corrected this line
            });
    } 
}

function ShowPost(postData, mode) {
    let postDiv;
    if (mode === 'preview') {
        postDiv = document.getElementById('newpost');
    } else if (mode === 'show') {
        postDiv = document.getElementById('your-posts');
    } else if (mode === 'public') {
        postDiv = document.getElementById('public-posts');
    } else {
        console.error('Invalid mode:', mode);
        return;
    }

    postDiv.style.visibility = "visible";
    
    if (mode === 'preview') {
        postDiv.innerHTML = '';
    }

    // Create the post container
    const postContainer = document.createElement('div');
    postContainer.classList.add('post-container');

    // Create the left container for images
    const leftContainer = document.createElement('div');
    leftContainer.classList.add('left-container');

    // Create and append images
    if (postData.images && postData.images.length > 0) {
        const imagesContainer = document.createElement('div');
        imagesContainer.classList.add('images-container');

        postData.images.forEach(base64Image => {
            const img = document.createElement('img');
            img.src = base64Image;
            img.alt = 'Post Image';
            img.classList.add('post-image');
            imagesContainer.appendChild(img);
        });

        leftContainer.appendChild(imagesContainer);
    }

    postContainer.appendChild(leftContainer);

    // Create the right container for text details
    const rightContainer = document.createElement('div');
    rightContainer.classList.add('right-container');

    // Create and append post title
    const title = document.createElement('h2');
    title.textContent = postData.title;
    title.classList.add('post-title');
    rightContainer.appendChild(title);

    // Create and append post category
    const category = document.createElement('p');
    category.textContent = `Category: ${postData.category}`;
    category.classList.add('post-category');
    rightContainer.appendChild(category);

    // Create and append post price
    const price = document.createElement('p');
    price.textContent = `Price: ₪${postData.price}`;
    price.classList.add('post-price');
    rightContainer.appendChild(price);

    // Create and append post contact
    const contact = document.createElement('p');
    contact.textContent = `Contact: ${postData.contact}`;
    contact.classList.add('post-contact');
    rightContainer.appendChild(contact);

    // Create and append garbage can icon (for user posts only)
    if (mode === 'show') {
        const garbageIcon = document.createElement('i');
        garbageIcon.classList.add('fas', 'fa-trash-alt', 'garbage-icon');
        garbageIcon.addEventListener('click', () => {
            deletePost(postData._id); // Call deletePost function when the garbage icon is clicked
        });
        rightContainer.appendChild(garbageIcon);
    }

    postContainer.appendChild(rightContainer);
    postDiv.appendChild(postContainer);
}

// Function to delete a post
async function deletePost(postId) {
    const response = await fetch(`/api/posts/${postId}`, { // Corrected the URL
        method: 'DELETE'
    });
    if (response.ok) {
        loadUserPosts(); // Reload user posts
    } 
}

function hidePreview() {
    const postDiv = document.getElementById('newpost');
    postDiv.style.visibility = 'hidden';
    postDiv.innerHTML = '';
}
