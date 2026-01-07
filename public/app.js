/**
 * UCAB Tasks - Frontend Application
 * Vanilla JavaScript SPA for note management
 */

// =============================================================================
// API Configuration
// =============================================================================

const API_BASE = '/api/notes';

// =============================================================================
// State Management
// =============================================================================

const state = {
    notes: [],
    currentNoteId: null,
    isEditing: false,
    hasUnsavedChanges: false,
};

// =============================================================================
// DOM Elements
// =============================================================================

const elements = {
    notesList: document.getElementById('notesList'),
    noteCount: document.getElementById('noteCount'),
    sortSelect: document.getElementById('sortSelect'),
    btnNewNote: document.getElementById('btnNewNote'),
    btnNewNoteEmpty: document.getElementById('btnNewNoteEmpty'),
    emptyState: document.getElementById('emptyState'),
    noteEditor: document.getElementById('noteEditor'),
    noteTitle: document.getElementById('noteTitle'),
    noteContent: document.getElementById('noteContent'),
    editorMeta: document.getElementById('editorMeta'),
    metaCreated: document.getElementById('metaCreated'),
    metaUpdated: document.getElementById('metaUpdated'),
    editorStatus: document.getElementById('editorStatus'),
    btnSave: document.getElementById('btnSave'),
    btnDelete: document.getElementById('btnDelete'),
    deleteModal: document.getElementById('deleteModal'),
    btnCancelDelete: document.getElementById('btnCancelDelete'),
    btnConfirmDelete: document.getElementById('btnConfirmDelete'),
    toastContainer: document.getElementById('toastContainer'),
};

// =============================================================================
// API Functions
// =============================================================================

/**
 * Fetches all notes from the API
 * @param {string} sortBy - Field to sort by
 * @param {string} order - Sort order (asc/desc)
 * @returns {Promise<Array>} Array of notes
 */
async function fetchNotes(sortBy = 'updatedAt', order = 'desc') {
    try {
        const response = await fetch(`${API_BASE}?sortBy=${sortBy}&order=${order}`);
        if (!response.ok) throw new Error('Error al cargar notas');
        return await response.json();
    } catch (error) {
        console.error('fetchNotes error:', error);
        showToast('Error al cargar las notas', 'error');
        return [];
    }
}

/**
 * Fetches a single note by ID
 * @param {string} id - Note ID
 * @returns {Promise<Object|null>} Note object or null
 */
async function fetchNoteById(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) throw new Error('Nota no encontrada');
        return await response.json();
    } catch (error) {
        console.error('fetchNoteById error:', error);
        showToast('Error al cargar la nota', 'error');
        return null;
    }
}

/**
 * Creates a new note
 * @param {Object} data - Note data (title, content)
 * @returns {Promise<Object|null>} Created note or null
 */
async function createNote(data) {
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Error al crear nota');
        return await response.json();
    } catch (error) {
        console.error('createNote error:', error);
        showToast('Error al crear la nota', 'error');
        return null;
    }
}

/**
 * Updates an existing note
 * @param {string} id - Note ID
 * @param {Object} data - Data to update
 * @returns {Promise<Object|null>} Updated note or null
 */
async function updateNote(id, data) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Error al actualizar nota');
        return await response.json();
    } catch (error) {
        console.error('updateNote error:', error);
        showToast('Error al guardar la nota', 'error');
        return null;
    }
}

/**
 * Deletes notes by IDs
 * @param {Array<string>} ids - Array of note IDs
 * @returns {Promise<Object|null>} Delete result or null
 */
async function deleteNotes(ids) {
    try {
        const response = await fetch(API_BASE, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });
        if (!response.ok) throw new Error('Error al eliminar notas');
        return await response.json();
    } catch (error) {
        console.error('deleteNotes error:', error);
        showToast('Error al eliminar la nota', 'error');
        return null;
    }
}

// =============================================================================
// UI Functions
// =============================================================================

/**
 * Formats a date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
}

/**
 * Formats a full date for metadata display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatFullDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Renders the notes list in the sidebar
 */
function renderNotesList() {
    const { notes, currentNoteId } = state;

    if (notes.length === 0) {
        elements.notesList.innerHTML = `
      <div class="empty-list">
        <p style="text-align: center; padding: 20px; color: var(--text-tertiary); font-size: 13px;">
          No hay notas
        </p>
      </div>
    `;
    } else {
        elements.notesList.innerHTML = notes
            .map(
                (note) => `
        <button 
          class="note-item ${note.id === currentNoteId ? 'active' : ''}" 
          data-id="${note.id}"
        >
          <div class="note-item-title">${escapeHtml(note.title) || 'Sin título'}</div>
          <div class="note-item-date">${formatDate(note.updatedAt)}</div>
        </button>
      `
            )
            .join('');
    }

    elements.noteCount.textContent = `${notes.length} nota${notes.length !== 1 ? 's' : ''}`;
}

/**
 * Escapes HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Shows the note editor with data
 * @param {Object} note - Note to display
 */
function showEditor(note) {
    state.currentNoteId = note.id;
    state.hasUnsavedChanges = false;

    elements.noteTitle.value = note.title;
    elements.noteContent.value = note.content;
    elements.metaCreated.textContent = `Creada: ${formatFullDate(note.createdAt)}`;
    elements.metaUpdated.textContent = `Modificada: ${formatFullDate(note.updatedAt)}`;
    elements.editorStatus.textContent = '';
    elements.editorStatus.className = 'editor-status';

    elements.emptyState.classList.add('hidden');
    elements.noteEditor.classList.remove('hidden');

    renderNotesList();
}

/**
 * Hides the editor and shows empty state
 */
function hideEditor() {
    state.currentNoteId = null;
    state.hasUnsavedChanges = false;

    elements.noteEditor.classList.add('hidden');
    elements.emptyState.classList.remove('hidden');

    renderNotesList();
}

/**
 * Shows a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, error, info)
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Shows the delete confirmation modal
 */
function showDeleteModal() {
    elements.deleteModal.classList.remove('hidden');
}

/**
 * Hides the delete confirmation modal
 */
function hideDeleteModal() {
    elements.deleteModal.classList.add('hidden');
}

/**
 * Sets the editor status message
 * @param {string} message - Status message
 * @param {string} type - Status type (saving, saved, error)
 */
function setEditorStatus(message, type = '') {
    elements.editorStatus.textContent = message;
    elements.editorStatus.className = `editor-status ${type}`;
}

// =============================================================================
// Event Handlers
// =============================================================================

/**
 * Handles creating a new note
 */
async function handleNewNote() {
    const note = await createNote({
        title: 'Nueva nota',
        content: '',
    });

    if (note) {
        await loadNotes();
        const fullNote = await fetchNoteById(note.id);
        if (fullNote) {
            showEditor(fullNote);
            elements.noteTitle.select();
        }
        showToast('Nota creada', 'success');
    }
}

/**
 * Handles selecting a note from the list
 * @param {string} noteId - ID of the note to select
 */
async function handleSelectNote(noteId) {
    if (state.hasUnsavedChanges) {
        await handleSave();
    }

    const note = await fetchNoteById(noteId);
    if (note) {
        showEditor(note);
    }
}

/**
 * Handles saving the current note
 */
async function handleSave() {
    if (!state.currentNoteId) return;

    setEditorStatus('Guardando...', 'saving');

    const updated = await updateNote(state.currentNoteId, {
        title: elements.noteTitle.value || 'Sin título',
        content: elements.noteContent.value,
    });

    if (updated) {
        state.hasUnsavedChanges = false;
        setEditorStatus('Guardado', 'saved');
        elements.metaUpdated.textContent = `Modificada: ${formatFullDate(updated.updatedAt)}`;
        await loadNotes();

        setTimeout(() => setEditorStatus(''), 2000);
    } else {
        setEditorStatus('Error al guardar', 'error');
    }
}

/**
 * Handles deleting the current note
 */
async function handleDelete() {
    if (!state.currentNoteId) return;

    const result = await deleteNotes([state.currentNoteId]);

    if (result && result.deletedCount > 0) {
        hideDeleteModal();
        hideEditor();
        await loadNotes();
        showToast('Nota eliminada', 'success');
    }
}

/**
 * Handles sort change
 */
async function handleSortChange() {
    const [sortBy, order] = elements.sortSelect.value.split('-');
    state.notes = await fetchNotes(sortBy, order);
    renderNotesList();
}

/**
 * Loads notes from the API
 */
async function loadNotes() {
    const [sortBy, order] = elements.sortSelect.value.split('-');
    state.notes = await fetchNotes(sortBy, order);
    renderNotesList();
}

// =============================================================================
// Event Listeners
// =============================================================================

// New note buttons
elements.btnNewNote.addEventListener('click', handleNewNote);
elements.btnNewNoteEmpty.addEventListener('click', handleNewNote);

// Note list click delegation
elements.notesList.addEventListener('click', (e) => {
    const noteItem = e.target.closest('.note-item');
    if (noteItem) {
        handleSelectNote(noteItem.dataset.id);
    }
});

// Sort change
elements.sortSelect.addEventListener('change', handleSortChange);

// Save button
elements.btnSave.addEventListener('click', handleSave);

// Delete button
elements.btnDelete.addEventListener('click', showDeleteModal);
elements.btnCancelDelete.addEventListener('click', hideDeleteModal);
elements.btnConfirmDelete.addEventListener('click', handleDelete);

// Close modal on overlay click
elements.deleteModal.addEventListener('click', (e) => {
    if (e.target === elements.deleteModal) {
        hideDeleteModal();
    }
});

// Track unsaved changes
elements.noteTitle.addEventListener('input', () => {
    state.hasUnsavedChanges = true;
});

elements.noteContent.addEventListener('input', () => {
    state.hasUnsavedChanges = true;
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
    }

    // Ctrl/Cmd + N to create new note
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewNote();
    }

    // Escape to close modal
    if (e.key === 'Escape' && !elements.deleteModal.classList.contains('hidden')) {
        hideDeleteModal();
    }
});

// Auto-save on blur
elements.noteTitle.addEventListener('blur', () => {
    if (state.hasUnsavedChanges) {
        handleSave();
    }
});

elements.noteContent.addEventListener('blur', () => {
    if (state.hasUnsavedChanges) {
        handleSave();
    }
});

// =============================================================================
// Initialization
// =============================================================================

/**
 * Initializes the application
 */
async function init() {
    await loadNotes();
    console.log('UCAB Tasks initialized');
}

// Start the app
init();
