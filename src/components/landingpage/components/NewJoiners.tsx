import * as React from "react";
import { NewJoinerType } from "../../../utils/types";

interface NewJoinersProps {
  newJoiners: NewJoinerType[];
}

const NewJoiners: React.FC<NewJoinersProps> = ({ newJoiners }) => {
  const hasData = Array.isArray(newJoiners) && newJoiners.length > 0;

  return (
    <div className="lp-card lp-newjoin-red lp-new-joiners">
      <div className="lp-newjoin-header">
        <h3>New Joiners</h3>
        <button className="lp-viewall">View all ➜</button>
      </div>

      {hasData ? (
        <div className="lp-newjoin-body">
          {newJoiners.map((nj) => (
            <div key={nj.id} className="lp-newjoin-item">
              <div className="lp-jn-name">{nj.name}</div>
              <div className="lp-jn-role">
                {nj.position}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="lp-newjoin-body">
          <div className="lp-jn-name">No new joiners</div>
        </div>
      )}
    </div>
  );
};

export default NewJoiners;
