const container = document.getElementById('postList');

// Modal references
const modal = document.getElementById('confirmationModal');
const modalMessage = document.getElementById('modalMessage');
const closeModalBtn = document.getElementById('closeModal');

let currentAction = null;
let currentPostId = null;

// Fetch and display posts
async function loadPosts() {
  try {
    const res = await fetch('/api/posts');
    const posts = await res.json();
    container.innerHTML = '';

    if (posts.length === 0) {
      container.innerHTML = '<p>No posts found.</p>';
      return;
    }

    posts.forEach(post => {
      const template = document.getElementById('postTemplate');
      const clone = template.content.cloneNode(true);

      // Text
      clone.querySelector('.post-text').textContent = post.text || '[No text]';

      // Media
      const mediaWrapper = clone.querySelector('.media-preview');
      if (post.media && post.media.length > 0) {
        post.media.forEach(url => {
          const ext = url.split('.').pop().toLowerCase();
          if (['mp4', 'webm'].includes(ext)) {
            const video = document.createElement('video');
            video.src = url;
            video.controls = true;
            mediaWrapper.appendChild(video);
          } else {
            const img = document.createElement('img');
            img.src = url;
            mediaWrapper.appendChild(img);
          }
        });
      }

      // User ID (optional display)
      clone.querySelector('.user-id').textContent = `User: ${post.userId || 'N/A'}`;

      // Buttons
      const deleteBtn = clone.querySelector('.delete-btn');
      const blockBtn = clone.querySelector('.block-btn');

      deleteBtn.onclick = () => showModal('delete', post._id);
      blockBtn.onclick = () => showModal('block', post._id);

      container.appendChild(clone);
    });

  } catch (error) {
    container.innerHTML = `<p>Error loading posts: ${error.message}</p>`;
  }
}

// Modal logic
function showModal(action, postId) {
  currentAction = action;
  currentPostId = postId;

  modalMessage.textContent = action === 'delete'
    ? 'Are you sure you want to delete this post?'
    : 'Block the user who submitted this post?';

  modal.style.display = 'flex';
}

function closeModal() {
  modal.style.display = 'none';
  currentAction = null;
  currentPostId = null;
}

document.getElementById('closeModal').onclick = closeModal;
window.onclick = (e) => {
  if (e.target === modal) closeModal();
}

// Handle confirm action dynamically
modal.addEventListener('click', async (e) => {
  if (e.target.tagName === 'BUTTON' && e.target.dataset.action) {
    const actionType = e.target.dataset.action;

    if (actionType === 'confirm') {
      if (!currentPostId || !currentAction) return;

      const endpoint = currentAction === 'delete'
        ? `/api/posts/${currentPostId}`
        : `/api/block/${currentPostId}`;

      try {
        await fetch(endpoint, {
          method: 'DELETE'
        });

        closeModal();
        loadPosts();
      } catch (err) {
        alert(`Failed to ${currentAction}: ${err.message}`);
      }
    }

    if (actionType === 'cancel') {
      closeModal();
    }
  }
});

// Init
loadPosts();
