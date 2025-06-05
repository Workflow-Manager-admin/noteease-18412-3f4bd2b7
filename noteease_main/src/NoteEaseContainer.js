import React, { useState } from "react";

// PUBLIC_INTERFACE
/**
 * The main NoteEase container: manages notes, categories, search, and edit UI.
 * Supports: Create, Edit, Delete, Search, and Categorize notes.
 *
 * Color scheme:
 *   - Primary (header/FAB/buttons): #4A90E2
 *   - Secondary (background/cards): #FFFFFF
 *   - Accent (category chip highlight): #F5A623
 * Uses a light theme.
 */
function NoteEaseContainer() {
  // Note structure: {id, title, content, category}
  const initialNotes = [
    {
      id: 1,
      title: "Welcome",
      content: "Get started by creating, editing, and categorizing your notes.",
      category: "General"
    }
  ];
  const initialCategories = ["All", "General", "Personal", "Work", "Ideas"];

  const [notes, setNotes] = useState(initialNotes);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [modalNote, setModalNote] = useState(null); // note being edited or null
  const [categories, setCategories] = useState(initialCategories);

  // Filter notes by search and selected category
  const filteredNotes = notes.filter((n) => {
    const matchCategory =
      selectedCategory === "All" || n.category === selectedCategory;
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // PUBLIC_INTERFACE
  function handleSaveNote(note) {
    if (!note.title.trim() && !note.content.trim()) return;
    if (note.category && !categories.includes(note.category)) {
      setCategories([...categories, note.category]);
    }
    if (note.id) {
      // Edit existing
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? note : n))
      );
    } else {
      // Create new note
      setNotes((prev) => [
        ...prev,
        { ...note, id: Date.now() }
      ]);
    }
    setShowModal(false);
    setModalNote(null);
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setShowModal(false);
    setModalNote(null);
  }

  // PUBLIC_INTERFACE
  function openNewNoteModal() {
    setModalNote({ id: null, title: "", content: "", category: "" });
    setShowModal(true);
  }

  // PUBLIC_INTERFACE
  function openEditNoteModal(note) {
    setModalNote({ ...note });
    setShowModal(true);
  }

  // PUBLIC_INTERFACE
  function handleCategoryChip(category) {
    setSelectedCategory(category);
  }

  // PUBLIC_INTERFACE
  function handleSearchChange(e) {
    setSearch(e.target.value);
  }

  // PUBLIC_INTERFACE
  function handleCloseModal() {
    setShowModal(false);
    setModalNote(null);
  }

  // UI below
  return (
    <div className="noteease-outer">
      {/* Search Bar */}
      <header className="noteease-header">
        <h2 className="noteease-logo">
          <span role="img" aria-label="note icon" style={{ marginRight: 8 }}>📝</span>
          NoteEase
        </h2>
        <input
          type="search"
          className="noteease-search"
          placeholder="Search notes..."
          value={search}
          onChange={handleSearchChange}
        />
      </header>

      {/* Category filter chips */}
      <div className="noteease-categories">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`noteease-chip${selectedCategory === cat ? " selected" : ""}`}
            style={{
              background:
                selectedCategory === cat
                  ? "#F5A623"
                  : "#f8f8f8",
              color:
                selectedCategory === cat
                  ? "#fff"
                  : "#4A90E2",
              borderColor:
                selectedCategory === cat
                  ? "#F5A623"
                  : "#d6e4f5"
            }}
            onClick={() => handleCategoryChip(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notes List */}
      <main className="noteease-content">
        {filteredNotes.length === 0 && (
          <div className="noteease-empty">No notes found.</div>
        )}
        <div className="noteease-notes-list">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="noteease-card"
              onClick={() => openEditNoteModal(note)}
              tabIndex={0}
              title="Edit note"
            >
              <div className="noteease-card-header">
                <span className="noteease-card-title">{note.title || "(Untitled)"}</span>
                <span className="noteease-card-category">
                  {note.category || "Uncategorized"}
                </span>
              </div>
              <div className="noteease-card-body">
                {note.content.slice(0, 70)}
                {note.content.length > 70 ? "..." : ""}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Action Button for 'Add Note' */}
      <button className="noteease-fab" aria-label="Add note" onClick={openNewNoteModal} title="New note">
        +
      </button>

      {/* Modal for Add/Edit Note */}
      {showModal && (
        <NoteModal
          note={modalNote}
          onSave={handleSaveNote}
          onClose={handleCloseModal}
          onDelete={modalNote && modalNote.id ? handleDeleteNote : null}
          categories={categories}
        />
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * Modal for Creating/Editing a note.
 * @param {Object} props
 *   note: { id, title, content, category }
 *   onSave: function(note)
 *   onClose: function()
 *   onDelete: function(id) [optional, only for edit]
 *   categories: string[] (optional)
 */
function NoteModal({ note, onSave, onClose, onDelete, categories }) {
  const [editNote, setEditNote] = useState({ ...note });
  // Only allow category already in list or enter new one
  const [newCategory, setNewCategory] = useState("");

  // PUBLIC_INTERFACE
  function handleFieldChange(e) {
    const { name, value } = e.target;
    setEditNote((prev) => ({ ...prev, [name]: value }));
  }
  // PUBLIC_INTERFACE
  function handleCategorySelect(e) {
    setEditNote({ ...editNote, category: e.target.value, newCategory: "" });
    setNewCategory("");
  }

  // PUBLIC_INTERFACE
  function handleNewCategory(e) {
    setNewCategory(e.target.value);
    setEditNote({ ...editNote, category: e.target.value });
  }

  // PUBLIC_INTERFACE
  function withSave(e) {
    e.preventDefault();
    onSave(editNote);
  }

  return (
    <div className="noteease-modal-backdrop" onClick={onClose}>
      <div className="noteease-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{editNote.id ? "Edit Note" : "New Note"}</h3>
        <form onSubmit={withSave} autoComplete="off">
          <input
            name="title"
            className="noteease-modal-title"
            placeholder="Title"
            value={editNote.title}
            onChange={handleFieldChange}
            autoFocus
            maxLength={80}
          />
          <textarea
            name="content"
            className="noteease-modal-body"
            placeholder="Write your note here..."
            value={editNote.content}
            onChange={handleFieldChange}
            rows={6}
            maxLength={1000}
          />
          <div className="noteease-modal-category-row">
            <select
              className="noteease-modal-category"
              value={
                editNote.category && categories.includes(editNote.category)
                  ? editNote.category
                  : ""
              }
              onChange={handleCategorySelect}
            >
              <option value="">Select category</option>
              {categories.filter(c => c !== "All").map((cat) => (
                <option value={cat} key={cat}>{cat}</option>
              ))}
            </select>
            <span style={{ margin: "0 8px", color: "#888" }}>or</span>
            <input
              type="text"
              className="noteease-modal-category"
              placeholder="New category"
              value={newCategory}
              onChange={handleNewCategory}
              maxLength={20}
            />
          </div>
          <div className="noteease-modal-actions">
            <button type="submit" className="noteease-modal-save">
              {editNote.id ? "Save" : "Add"}
            </button>
            {onDelete && (
              <button
                type="button"
                className="noteease-modal-delete"
                onClick={() => onDelete(editNote.id)}
              >
                Delete
              </button>
            )}
            <button
              type="button"
              className="noteease-modal-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NoteEaseContainer;
