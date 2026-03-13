"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Slide } from "@/types";

interface SlidePanelProps {
  slides: Slide[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (type: Slide["type"]) => void;
  onDelete: (id: string) => void;
  onReorder: (slides: Slide[]) => void;
}

const TYPE_LABEL: Record<Slide["type"], string> = {
  image: "🖼 이미지",
  video: "🎬 영상",
  "text-scroll": "📜 텍스트",
};

const TYPE_BG: Record<Slide["type"], string> = {
  image: "bg-purple-500/20 text-purple-300",
  video: "bg-orange-500/20 text-orange-300",
  "text-scroll": "bg-cyan-500/20 text-cyan-300",
};

export default function SlidePanel({
  slides,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
}: SlidePanelProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(slides);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    onReorder(items.map((s, i) => ({ ...s, order: i })));
  };

  return (
    <div className="w-56 shrink-0 bg-[#141414] border-r border-white/10 flex flex-col">
      <div className="px-3 py-3 border-b border-white/10">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">슬라이드</p>
        {/* Add slide buttons */}
        <div className="flex flex-col gap-1">
          {(["image", "video", "text-scroll"] as Slide["type"][]).map((t) => (
            <button
              key={t}
              onClick={() => onAdd(t)}
              className="text-left text-xs px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              + {TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="slides">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex-1 overflow-y-auto py-2 px-2"
            >
              {slides.length === 0 && (
                <p className="text-xs text-white/20 text-center mt-4 px-2">
                  위에서 슬라이드를 추가하세요
                </p>
              )}
              {slides.map((slide, index) => (
                <Draggable key={slide.id} draggableId={slide.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => onSelect(slide.id)}
                      className={`group relative rounded-lg px-2.5 py-2 mb-1 cursor-pointer transition-colors ${
                        selectedId === slide.id
                          ? "bg-blue-600/30 border border-blue-500/50"
                          : "bg-white/5 border border-transparent hover:bg-white/10"
                      } ${snapshot.isDragging ? "shadow-xl opacity-90" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${TYPE_BG[slide.type]}`}>
                            {TYPE_LABEL[slide.type]}
                          </span>
                          <p className="text-[11px] text-white/40 mt-1 truncate">
                            슬라이드 {index + 1}
                          </p>
                          {slide.duration && (
                            <p className="text-[10px] text-white/30">{slide.duration}s</p>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(slide.id); }}
                          className="opacity-0 group-hover:opacity-100 text-red-400/70 hover:text-red-400 text-xs transition-opacity shrink-0 mt-0.5"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
