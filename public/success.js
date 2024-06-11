function ShowPostbtn(){
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
                    pictures: base64Images
                };
                ShowPost(postData);
            })
            .catch(error => {
                showMessage("Error converting images: " + error.message);
            });
    } else {
        showMessage("All fields are required to see the post");
    }
}

function ShowPost(postData) {
    const postDiv = document.getElementById("post");
    postDiv.style.visibility = "visible";
    
    // Clear previous content
    postDiv.innerHTML = '';

    // Create the post container
    const postContainer = document.createElement('div');
    postContainer.classList.add('post-container');

    // Create the left container for images
    const leftContainer = document.createElement('div');
    leftContainer.classList.add('left-container');

    // Create and append images
    if (postData.pictures && postData.pictures.length > 0) {
        const imagesContainer = document.createElement('div');
        imagesContainer.classList.add('images-container');

        postData.pictures.forEach(base64Image => {
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
    price.textContent = `Price: $${postData.price}`;
    price.classList.add('post-price');
    rightContainer.appendChild(price);

    // Create and append post contact
    const contact = document.createElement('p');
    contact.textContent = `Contact: ${postData.contact}`;
    contact.classList.add('post-contact');
    rightContainer.appendChild(contact);

    postContainer.appendChild(rightContainer);
    postDiv.appendChild(postContainer);
}

document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('postForm');
    const usernameSpan = document.getElementById('username');

    // Fetch username
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                UserName = data.username;
                usernameSpan.textContent = data.username;
            }
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
                            pictures: base64Images                    
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
                                showMessage("Post uploaded successfully");
                            } else {
                                showMessage("Failed to upload post");
                            }
                        })
                        .catch(error => {
                            showMessage("Error: " + error.message);
                        });
                    })
                    .catch(error => {
                        showMessage("Error converting images: " + error.message);
                    });
            } else {
                showMessage("All fields are required to save the post");
            }
        });
    }

    function showMessage(msg) {
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.textContent = msg;
        } else {
            console.error("Message div not found");
        }
    }
});
