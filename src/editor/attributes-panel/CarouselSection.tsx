import { CarouselAttributes, CarouselNavigation } from "@common/shared/models";
import { MdAdd, MdDelete } from "react-icons/md";
import { v4 as uuid } from "uuid";

import { CollapsibleSection } from "./CollapsibleSection.tsx";
import { Toggle } from "./Toggle.tsx";

export type CarouselSectionProps = {
  attr: CarouselAttributes;
  onUpdate: (attr: CarouselAttributes, type: string) => void;
};

export function CarouselSection({ attr, onUpdate }: CarouselSectionProps) {
  const handlePageSelect = (index: number) => {
    onUpdate({ ...attr, activePageIndex: index }, "widget.carousel.activePage");
  };

  const handleAddPage = () => {
    const newPages = [...attr.pages, { id: uuid(), widgets: [] }];
    onUpdate(
      { ...attr, pages: newPages, activePageIndex: newPages.length - 1 },
      "widget.carousel.addPage",
    );
  };

  const handleDeletePage = (index: number) => {
    if (attr.pages.length <= 1) return;
    const newPages = attr.pages.filter((_, i) => i !== index);
    const newActiveIndex = Math.min(attr.activePageIndex, newPages.length - 1);
    onUpdate(
      { ...attr, pages: newPages, activePageIndex: newActiveIndex },
      "widget.carousel.deletePage",
    );
  };

  const handleNavigationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(
      { ...attr, navigation: e.target.value as CarouselNavigation },
      "widget.carousel.navigation",
    );
  };

  const toggleHideIndicators = () => {
    onUpdate(
      { ...attr, hidePageIndicators: !attr.hidePageIndicators },
      "widget.carousel.pageIndicatorsChange",
    );
  };

  return (
    <CollapsibleSection title="Carousel">
      <div className="col gap-8">
        <div className="row align-items-center gap-8">
          <label style={{ fontSize: 12, opacity: 0.7, flex: 1 }}>Navigation</label>
          <select
            value={attr.navigation ?? "swipe"}
            onChange={handleNavigationChange}
            style={{ fontSize: 12 }}
          >
            <option value="swipe">Swipe</option>
            <option value="buttons">Buttons</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
        <div className="col gap-4">
          {attr.pages.map((page, i) => (
            <div
              key={page.id}
              className="row align-items-center gap-8"
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                background:
                  i === attr.activePageIndex
                    ? "rgba(255,255,255,0.1)"
                    : undefined,
                cursor: "pointer",
              }}
              onClick={() => handlePageSelect(i)}
            >
              <span style={{ flex: 1, fontSize: 12 }}>
                Page {i + 1}
                {page.widgets.length > 0 && (
                  <span style={{ opacity: 0.5 }}>
                    {" "}
                    ({page.widgets.length} widget
                    {page.widgets.length !== 1 ? "s" : ""})
                  </span>
                )}
              </span>
              {attr.pages.length > 1 && (
                <MdDelete
                  size={14}
                  style={{ opacity: 0.5, cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePage(i);
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <button
          className="btn btn-sm row align-items-center gap-4"
          onClick={handleAddPage}
        >
          <MdAdd size={14} />
          <span>Add Page</span>
        </button>
        <div className="row align-items-center gap-12">
          <span>Hide Indicators:</span>
          <Toggle value={attr.hidePageIndicators} onToggle={toggleHideIndicators} />
        </div>
      </div>
    </CollapsibleSection>
  );
}
